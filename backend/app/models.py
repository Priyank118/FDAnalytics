from . import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    first_name = db.Column(db.String(80), nullable=True)
    last_name = db.Column(db.String(80), nullable=True)
    password_hash = db.Column(db.String(256), nullable=True)
    bgmi_username = db.Column(db.String(80), nullable=True, unique=True)
    bio = db.Column(db.Text, nullable=True)
    country = db.Column(db.String(80), nullable=True)
    instagram_url = db.Column(db.String(200), nullable=True)
    youtube_url = db.Column(db.String(200), nullable=True)
    def set_password(self, password): self.password_hash = generate_password_hash(password)
    def check_password(self, password): return self.password_hash and check_password_hash(self.password_hash, password)

class MatchEvent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    match_date = db.Column(db.DateTime, default=datetime.utcnow)
    map_name = db.Column(db.String(50))
    team_rank = db.Column(db.Integer)
    uploaded_by_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    performances = db.relationship('PerformanceRecord', backref='match_event', cascade="all, delete-orphan")

class PerformanceRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer, db.ForeignKey('match_event.id'))
    player_ign = db.Column(db.String(80))
    kills = db.Column(db.Integer)
    assists = db.Column(db.Integer)
    damage = db.Column(db.Integer)
    revives = db.Column(db.Integer)
    # --- NEW COLUMNS ---
    survival_time_sec = db.Column(db.Float, default=0.0) # Storing '19.3m' as a string
    recall = db.Column(db.Integer)
    rating = db.Column(db.Float)

class RosterPlayer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    player_ign = db.Column(db.String(80), nullable=False)
    manager_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)