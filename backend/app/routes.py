from flask import Blueprint, request, jsonify, url_for, redirect, current_app
from flask_login import login_user, logout_user, login_required, current_user
from sqlalchemy import func
from . import db, oauth
from .models import User, MatchEvent, PerformanceRecord, RosterPlayer
import os
import re
from werkzeug.utils import secure_filename
from google.cloud import vision
from difflib import get_close_matches
from .recommendation_engine import generate_recommendations

api = Blueprint('api', __name__)

# --- AUTH & OAUTH ROUTES ---

@api.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    data = request.get_json()
    if not data or not all(k in data for k in ['username', 'email', 'password']):
        return jsonify({'message': 'Username, email, and password are required!'}), 400
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists!'}), 409
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email address already in use!'}), 409
    new_user = User(
        username=data['username'], email=data['email'],
        first_name=data.get('first_name'), last_name=data.get('last_name')
    )
    new_user.set_password(data['password'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully!'}), 201

@api.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    data = request.get_json()
    if not data or not all(k in data for k in ['username', 'password']):
        return jsonify({'message': 'Username and password are required!'}), 400
    user = User.query.filter((User.username == data['username']) | (User.email == data['username'])).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
    login_user(user)
    return jsonify({'message': 'Logged in successfully!', 'user': {'id': user.id, 'username': user.username}}), 200

@api.route('/google/login')
def google_login():
    redirect_uri = url_for('api.google_callback', _external=True)
    return oauth.google.authorize_redirect(redirect_uri)

@api.route('/google/callback')
def google_callback():
    token = oauth.google.authorize_access_token()
    user_info = token.get('userinfo')
    if user_info:
        user = User.query.filter_by(email=user_info['email']).first()
        if not user:
            user = User(
                email=user_info['email'], username=user_info['name'],
                first_name=user_info.get('given_name'), last_name=user_info.get('family_name'),
                bgmi_username=user_info.get('name') # Default BGMI name
            )
            db.session.add(user)
            db.session.commit()
        login_user(user)
    return redirect('http://localhost:5173/dashboard')

# --- USER, PROFILE, STATUS & LOGOUT ROUTES ---

@api.route('/status')
@login_required
def status():
    return jsonify({'id': current_user.id, 'username': current_user.username, 'bgmi_username': current_user.bgmi_username}), 200

@api.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully!'}), 200

@api.route('/profile')
@login_required
def get_profile():
    return jsonify({
        'username': current_user.username, 'email': current_user.email,
        'first_name': current_user.first_name, 'last_name': current_user.last_name,
        'bgmi_username': current_user.bgmi_username, 'bio': current_user.bio,
        'country': current_user.country, 'instagram_url': current_user.instagram_url,
        'youtube_url': current_user.youtube_url
    }), 200

@api.route('/profile', methods=['PUT'])
@login_required
def update_profile():
    data = request.get_json()
    if 'username' in data and data['username'] != current_user.username and User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 409
    if 'bgmi_username' in data and data['bgmi_username'] != current_user.bgmi_username and User.query.filter_by(bgmi_username=data['bgmi_username']).first():
        return jsonify({'message': 'BGMI Username is already linked.'}), 409
    for field in ['username', 'first_name', 'last_name', 'bgmi_username', 'bio', 'country', 'instagram_url', 'youtube_url']:
        if field in data:
            setattr(current_user, field, data[field])
    db.session.commit()
    return jsonify({'message': 'Profile updated successfully'}), 200

# --- TEAM ROSTER & PLAYER ROUTES ---

@api.route('/players')
@login_required
def get_all_players():
    # Fetch from the Roster table now
    player_records = db.session.query(RosterPlayer.player_ign).filter(RosterPlayer.manager_id == current_user.id).distinct().all()
    players = [record[0] for record in player_records]
    return jsonify(players)

@api.route('/team', methods=['GET'])
@login_required
def get_team():
    roster_players = RosterPlayer.query.filter_by(manager_id=current_user.id).all()
    players = [p.player_ign for p in roster_players]
    return jsonify(players)

@api.route('/team/add', methods=['POST'])
@login_required
def add_to_team():
    data = request.get_json()
    if not data or 'player_ign' not in data: return jsonify({'message': 'Player IGN is required.'}), 400
    player_ign = data['player_ign'].strip()
    if not player_ign: return jsonify({'message': 'Player IGN cannot be empty.'}), 400
    if RosterPlayer.query.filter_by(manager_id=current_user.id, player_ign=player_ign).first():
        return jsonify({'message': 'Player is already on the roster.'}), 409
    new_player = RosterPlayer(manager_id=current_user.id, player_ign=player_ign)
    db.session.add(new_player)
    db.session.commit()
    return jsonify({'message': f'{player_ign} added to the roster.'}), 201

@api.route('/team/remove', methods=['POST'])
@login_required
def remove_from_team():
    data = request.get_json()
    if not data or 'player_ign' not in data: return jsonify({'message': 'Player IGN is required.'}), 400
    player_ign = data['player_ign']
    RosterPlayer.query.filter_by(manager_id=current_user.id, player_ign=player_ign).delete()
    db.session.commit()
    return jsonify({'message': f'{player_ign} has been removed from the roster.'}), 200

# --- MATCH DATA & OCR ROUTES ---

# Add this PUT route inside the MATCH DATA & OCR ROUTES section
@api.route('/matches/<int:event_id>', methods=['PUT'])
@login_required
def update_match_event(event_id):
    """Updates general details of a match event (Map, Rank)."""
    match_event = MatchEvent.query.get(event_id)
    if not match_event or match_event.uploaded_by_id != current_user.id:
        return jsonify({'message': 'Match not found or unauthorized'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400

    if 'map_name' in data:
        match_event.map_name = data['map_name']
    if 'team_rank' in data:
        try:
            match_event.team_rank = int(data['team_rank'])
        except (ValueError, TypeError):
            return jsonify({'message': 'Invalid Team Rank format.'}), 400

    db.session.commit()
    return jsonify({'message': 'Match info updated successfully.'}), 200

@api.route('/matches')
@login_required
def get_matches():
    events = MatchEvent.query.filter_by(uploaded_by_id=current_user.id).order_by(MatchEvent.match_date.desc()).all()
    events_list = []
    for event in events:
        # --- THIS IS THE CHANGE ---
        # Include p.id in the performance data
        performances = [{'id': p.id, 'player_ign': p.player_ign, 'kills': p.kills, 'damage': p.damage} for p in event.performances]
        events_list.append({
            'id': event.id, 'match_date': event.match_date.strftime('%Y-%m-%d'),
            'map_name': event.map_name, 'team_rank': event.team_rank, 'performances': performances
        })
    return jsonify(events_list)

@api.route('/matches/<int:event_id>', methods=['GET'])
@login_required
def get_single_match_event(event_id):
    match_event = MatchEvent.query.get(event_id)
    if not match_event or match_event.uploaded_by_id != current_user.id:
        return jsonify({'message': 'Match not found or unauthorized'}), 404
    
    performances = []
    for p in match_event.performances:
        # Create stats dict for the recommendation engine
        stats_dict = {
            'kills': p.kills, 'assists': p.assists, 'damage': p.damage, 
            'revives': p.revives, 'recall': p.recall, 'rating': p.rating,
            'survival_time_sec': p.survival_time_sec, 
            'team_rank': match_event.team_rank # Include overall rank
        }
        recommendations = generate_recommendations(stats_dict, is_overall=False)
        
        performances.append({
            'id': p.id, 'player_ign': p.player_ign,
            'kills': p.kills, 'assists': p.assists, 'damage': p.damage, 'revives': p.revives,
            'survival_time_sec': p.survival_time_sec, 'recall': p.recall, 'rating': p.rating,
            'recommendations': recommendations # <-- Add recommendations
        })
        
    return jsonify({
        'id': match_event.id, 'match_date': match_event.match_date.strftime('%Y-%m-%d %H:%M'), 
        'map_name': match_event.map_name, 'team_rank': match_event.team_rank, 
        'performances': performances
    })

@api.route('/matches/<int:event_id>', methods=['DELETE'])
@login_required
def delete_match(event_id):
    match = MatchEvent.query.get(event_id)
    if not match or match.uploaded_by_id != current_user.id:
        return jsonify({'message': 'Match not found or unauthorized'}), 404
    db.session.delete(match)
    db.session.commit()
    return jsonify({'message': 'Match deleted successfully'}), 200

@api.route('/upload-match-result', methods=['POST'])
@login_required
def upload_match_result():
    if 'file' not in request.files: return jsonify({'message': 'No file part'}), 400
    file = request.files['file']
    if not file or file.filename == '': return jsonify({'message': 'No selected file'}), 400
    filepath = None
    try:
        filename = secure_filename(file.filename)
        filepath = os.path.join(current_app.root_path, filename)
        file.save(filepath)
        key_path = os.path.join(os.path.dirname(current_app.root_path), 'gcp_key.json')
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = key_path
        client = vision.ImageAnnotatorClient()
        with open(filepath, 'rb') as image_file: content = image_file.read()
        image = vision.Image(content=content)
        response = client.text_detection(image=image)
        os.remove(filepath)
        filepath = None
        if response.error.message: raise Exception(f'Google Vision Error: {response.error.message}')
        texts = response.text_annotations
        if not texts: return jsonify({'message': 'OCR could not read any text.'}), 400

        # --- FINAL COORDINATE-BASED PARSING LOGIC ---
        headers = {}
        header_candidates = ['finishes', 'assists', 'damage', 'survived', 'rescue', 'recall', 'rating']
        header_y_coord = 0
        for text in texts:
            desc = text.description.lower()
            if desc in header_candidates:
                x_center = (text.bounding_poly.vertices[0].x + text.bounding_poly.vertices[1].x) / 2
                headers[desc] = x_center
                header_y_coord = (text.bounding_poly.vertices[0].y + text.bounding_poly.vertices[2].y) / 2

        players = []
        blacklist = ['player', 'weapon', 'report', 'mvp', 'sss', 'back', 'share', 'krafion', 'bgmi']
        blacklist.extend(header_candidates)
        for text in texts:
            desc = text.description
            if any(c.isalpha() for c in desc) and desc.lower() not in blacklist and len(desc.split()) <= 2:
                y_center = (text.bounding_poly.vertices[0].y + text.bounding_poly.vertices[2].y) / 2
                if text.bounding_poly.vertices[0].x < 500 and y_center > (header_y_coord + 10):
                    if not any(abs(p['y'] - y_center) < 15 for p in players):
                        players.append({'ign': desc, 'y': y_center, 'stats': {}})

        for text in texts:
            desc = text.description
            is_stat_value = desc.replace('.', '', 1).isdigit() or (desc.lower().endswith('m') and desc[:-1].replace('.', '', 1).isdigit())
            if is_stat_value:
                x = (text.bounding_poly.vertices[0].x + text.bounding_poly.vertices[1].x) / 2
                y = (text.bounding_poly.vertices[0].y + text.bounding_poly.vertices[2].y) / 2
                closest_player = min(players, key=lambda p: abs(p['y'] - y), default=None)
                if not closest_player or abs(closest_player['y'] - y) > 30: continue
                closest_header = min(headers.keys(), key=lambda h: abs(headers[h] - x), default=None)
                if not closest_header or abs(headers[closest_header] - x) > 100: continue
                closest_player['stats'][closest_header] = desc

        full_text_string = texts[0].description
        team_rank_line = next((line for line in full_text_string.split('\n') if re.search(r'#\d+', line) and len(line) < 15), None)
        team_rank = int(re.findall(r'\d+', team_rank_line.replace('I', '1'))[0]) if team_rank_line else 99
        map_line = next((line for line in full_text_string.split('\n') if 'Ranked Classic' in line), None)
        map_name = map_line.split('-')[-1].strip() if map_line else "Unknown"
        new_match_event = MatchEvent(uploaded_by_id=current_user.id, map_name=map_name, team_rank=team_rank)
        db.session.add(new_match_event)

        roster = [p.player_ign for p in RosterPlayer.query.filter_by(manager_id=current_user.id).all()]
        
        found_players_count = 0
        for player_data in players:
            stats = player_data['stats']
            if 'finishes' in stats:
                ocr_ign = player_data['ign']
                matches = get_close_matches(ocr_ign, roster, n=1, cutoff=0.7)
                if matches:
                    canonical_ign = matches[0]
                    survival_sec = 0.0
                    survival_str = stats.get('survived', '0m')
                    if 'm' in survival_str:
                        try: survival_sec = float(survival_str.replace('m', '')) * 60
                        except ValueError: pass
                    try:
                        performance = PerformanceRecord(
                            match_event=new_match_event, player_ign=canonical_ign,
                            kills=int(float(stats.get('finishes', 0))),
                            assists=int(float(stats.get('assists', 0))),
                            damage=int(float(stats.get('damage', 0))),
                            revives=int(float(stats.get('rescue', 0))),
                            survival_time_sec=survival_sec,
                            recall=int(float(stats.get('recall', 0))),
                            rating=float(stats.get('rating', 0.0))
                        )
                        db.session.add(performance)
                        found_players_count += 1
                    except (ValueError, TypeError):
                        print(f"Skipping potentially invalid stats for {canonical_ign}: {stats}")
                        continue
        
        if found_players_count == 0:
            db.session.rollback()
            return jsonify({'message': 'Could not parse or match any valid player stats.'}), 400

        db.session.commit()
        return jsonify({'message': f'Successfully saved stats for {found_players_count} matched players.'}), 201
    except Exception as e:
        if filepath and os.path.exists(filepath): os.remove(filepath)
        db.session.rollback()
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500
        

# --- ANALYTICS ROUTE ---

@api.route('/stats/overview')
@login_required
def get_overview_stats():
    player_ign = request.args.get('player_ign')
    if not player_ign: return jsonify({'message': 'player_ign parameter is required.'}), 400

    # --- UPDATED QUERY ---
    # We now calculate averages for all the new fields
    stats = db.session.query(
        func.count(PerformanceRecord.id).label('total_matches'),
        func.avg(PerformanceRecord.kills).label('avg_kills'),
        func.avg(PerformanceRecord.damage).label('avg_damage'),
        func.avg(PerformanceRecord.assists).label('avg_assists'),
        func.avg(PerformanceRecord.revives).label('avg_revives'),
        func.avg(PerformanceRecord.survival_time_sec).label('avg_survival_time_sec'),
        func.avg(PerformanceRecord.recall).label('avg_recall'),
        func.avg(PerformanceRecord.rating).label('avg_rating')
    ).filter(PerformanceRecord.player_ign.ilike(player_ign)).first()

    total_matches = stats.total_matches or 0
    
    # Define overall_recommendations as empty list by default
    overall_recommendations = []
    
    if total_matches == 0:
        return jsonify(
            total_matches=0, avg_kills=0, avg_damage=0, win_rate=0,
            avg_assists=0, avg_revives=0, avg_survival_time_sec=0,
            avg_recall=0, avg_rating=0, recent_performance={},
            overall_recommendations=overall_recommendations
        ), 200
    
    win_count = db.session.query(func.count(MatchEvent.id)).join(PerformanceRecord).filter(
        PerformanceRecord.player_ign.ilike(player_ign),
        MatchEvent.team_rank == 1
    ).scalar()
    win_rate = (win_count / total_matches) * 100 if total_matches > 0 else 0
    
    recent = PerformanceRecord.query.filter(PerformanceRecord.player_ign.ilike(player_ign)).order_by(PerformanceRecord.id.desc()).limit(20).all()
    recent.reverse()
    
    # --- Generate Overall Recommendations ---
    avg_stats_dict = {
        'kills': stats.avg_kills or 0,
        'damage': stats.avg_damage or 0,
        'assists': stats.avg_assists or 0,
        'win_rate': win_rate,
    }
    # This line now correctly updates the existing list
    from .recommendation_engine import generate_recommendations
    overall_recommendations = generate_recommendations(avg_stats_dict, is_overall=True)
    
    # --- UPDATED RESPONSE ---
    return jsonify({
        'total_matches': total_matches,
        'avg_kills': round(stats.avg_kills or 0, 2),
        'avg_damage': round(stats.avg_damage or 0, 2),
        'win_rate': round(win_rate, 2),
        'avg_assists': round(stats.avg_assists or 0, 2),
        'avg_revives': round(stats.avg_revives or 0, 2),
        'avg_survival_time_sec': round(stats.avg_survival_time_sec or 0, 2),
        'avg_recall': round(stats.avg_recall or 0, 2),
        'avg_rating': round(stats.avg_rating or 0, 2),
        'recent_performance': {
            'labels': [p.match_event.match_date.strftime('%b %d') for p in recent],
            'kills_data': [p.kills for p in recent]
        },
        'overall_recommendations': overall_recommendations
    })

# --- MANUAL MATCH ENTRY ROUTE ---
#     
@api.route('/add-manual-match', methods=['POST'])
@login_required
def add_manual_match():
    data = request.get_json()
    if not data or 'team_rank' not in data or 'performances' not in data:
        return jsonify({'message': 'Missing required data.'}), 400

    try:
        new_match_event = MatchEvent(
            uploaded_by_id=current_user.id,
            map_name=data.get('map_name'),
            team_rank=data.get('team_rank')
        )
        db.session.add(new_match_event)
        
        for p in data['performances']:
            if not p.get('player_ign'): continue # Skip if no player name provided

            # --- Convert survival time M:S to seconds ---
            survival_sec = 0.0
            if 'survival_minutes' in p or 'survival_seconds' in p:
                 mins = int(p.get('survival_minutes', 0))
                 secs = int(p.get('survival_seconds', 0))
                 survival_sec = (mins * 60) + secs

            performance = PerformanceRecord(
                match_event=new_match_event,
                player_ign=p.get('player_ign'),
                kills=int(p.get('kills', 0)),
                assists=int(p.get('assists', 0)),
                damage=int(p.get('damage', 0)),
                revives=int(p.get('revives', 0)),
                # --- Save new fields ---
                survival_time_sec=survival_sec,
                recall=int(p.get('recall', 0)),
                rating=float(p.get('rating', 0.0))
            )
            db.session.add(performance)
        
        db.session.commit()
        return jsonify({'message': 'Match added successfully!'}), 201
    except (ValueError, TypeError):
        db.session.rollback()
        return jsonify({'message': 'Invalid data format for stats.'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500

# --- EDIT SINGLE PLAYER PERFORMANCE RECORD ROUTE ---

@api.route('/performances/<int:perf_id>', methods=['PUT'])
@login_required
def update_performance_record(perf_id):
    record = PerformanceRecord.query.get(perf_id)
    if not record:
        return jsonify({'message': 'Performance record not found'}), 404

    match_event = MatchEvent.query.get(record.match_id)
    if not match_event or match_event.uploaded_by_id != current_user.id:
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400

    roster = [p.player_ign for p in RosterPlayer.query.filter_by(manager_id=current_user.id).all()]

    try:
        # --- Handle IGN Change and Merging ---
        if 'player_ign' in data and data['player_ign'] != record.player_ign:
            new_ign = data['player_ign'].strip()
            if not new_ign:
                return jsonify({'message': 'Player IGN cannot be empty.'}), 400
            
            # Find the closest match in the current roster (excluding the player's own old name)
            current_roster_without_self = [ign for ign in roster if ign != record.player_ign]
            matches = get_close_matches(new_ign, current_roster_without_self, n=1, cutoff=0.9) # Higher cutoff for manual edit

            if matches:
                # Merge into existing player: Update this record's IGN to the matched name
                print(f"Merging record {perf_id} from {record.player_ign} to {matches[0]}")
                record.player_ign = matches[0]
                # Optional: Delete the old roster entry if no other records use it
                old_ign_entry = RosterPlayer.query.filter_by(manager_id=current_user.id, player_ign=record.player_ign).first()
                # Check if any *other* performance record still uses the old IGN for this manager
                other_records_exist = PerformanceRecord.query.join(MatchEvent).filter(
                    MatchEvent.uploaded_by_id == current_user.id,
                    PerformanceRecord.player_ign == record.player_ign,
                    PerformanceRecord.id != perf_id # Exclude the current record
                ).first()
                if old_ign_entry and not other_records_exist:
                    db.session.delete(old_ign_entry)

            else:
                 # It's a new name or significantly different, update roster if needed
                old_ign = record.player_ign
                roster_entry = RosterPlayer.query.filter_by(manager_id=current_user.id, player_ign=old_ign).first()
                if roster_entry:
                     roster_entry.player_ign = new_ign # Update roster name
                record.player_ign = new_ign # Update performance record name
        # --- End IGN Change Logic ---

        # Update numeric stats
        if 'kills' in data: record.kills = int(data['kills'])
        if 'assists' in data: record.assists = int(data['assists'])
        if 'damage' in data: record.damage = int(data['damage'])
        if 'revives' in data: record.revives = int(data['revives'])
        if 'recall' in data: record.recall = int(data['recall'])
        if 'rating' in data: record.rating = float(data['rating'])
        # Update survival time (convert M:S back to seconds)
        if 'survival_minutes' in data or 'survival_seconds' in data:
            mins = int(data.get('survival_minutes', 0))
            secs = int(data.get('survival_seconds', 0))
            record.survival_time_sec = (mins * 60) + secs
            
    except (ValueError, TypeError) as e:
        print(f"Error converting data: {e}") # Log the specific conversion error
        return jsonify({'message': 'Invalid data format for stats.'}), 400

    db.session.commit()
    return jsonify({'message': f'Stats for {record.player_ign} updated.'}), 200

# --- NEW: DELETE Single Performance Record ---
@api.route('/performances/<int:perf_id>', methods=['DELETE'])
@login_required
def delete_performance_record(perf_id):
    record = PerformanceRecord.query.get(perf_id)
    if not record: return jsonify({'message': 'Performance record not found'}), 404
    match_event = MatchEvent.query.get(record.match_id)
    if not match_event or match_event.uploaded_by_id != current_user.id:
        return jsonify({'message': 'Unauthorized'}), 403
    db.session.delete(record)
    db.session.commit()
    return jsonify({'message': f'Performance record for {record.player_ign} deleted.'}), 200

# --- ADD THIS NEW ROUTE ---
@api.route('/matches/<int:event_id>/performances', methods=['POST'])
@login_required
def add_performance_record(event_id):
    match_event = MatchEvent.query.get(event_id)
    if not match_event or match_event.uploaded_by_id != current_user.id:
        return jsonify({'message': 'Match not found or unauthorized'}), 404

    data = request.get_json()
    if not data or 'player_ign' not in data or not data['player_ign'].strip():
        return jsonify({'message': 'Player IGN is required and cannot be empty.'}), 400

    player_ign = data['player_ign'].strip()

    # Check if player already exists for this match
    existing = PerformanceRecord.query.filter_by(match_id=event_id, player_ign=player_ign).first()
    if existing:
        return jsonify({'message': 'This player already has stats for this match. Edit them instead.'}), 409

    # Add player to roster if they aren't already there
    roster_entry = RosterPlayer.query.filter_by(manager_id=current_user.id, player_ign=player_ign).first()
    if not roster_entry:
        db.session.add(RosterPlayer(manager_id=current_user.id, player_ign=player_ign))

    try:
        performance = PerformanceRecord(
            match_id=event_id, # Link to the correct match event
            player_ign=player_ign,
            kills=int(data.get('kills', 0)),
            assists=int(data.get('assists', 0)),
            damage=int(data.get('damage', 0)),
            revives=int(data.get('revives', 0)),
            # Set defaults for other fields if necessary
            survival_time_sec=0,
            recall=0,
            rating=0.0
        )
        db.session.add(performance)
        db.session.commit()
        return jsonify({'message': f'Performance added for {player_ign}.'}), 201
    except (ValueError, TypeError):
        db.session.rollback()
        return jsonify({'message': 'Invalid data format for stats.'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500