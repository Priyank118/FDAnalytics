import random

# --- Thresholds for Analysis ---
# Single Match

THRESHOLDS = {
    'high_kills': 6,
    'low_kills': 2,
    'high_damage': 900,
    'low_damage': 300,
    'good_rank': 3,
    'poor_rank': 12,
    'high_assists': 4,
    'high_revives': 2,
    'high_rating': 90.0,
    'short_survival_sec': 600,
    'avg_high_kills': 4.0,
    'avg_low_kills': 1.5,
    'avg_good_winrate': 15.0,
    'avg_poor_winrate': 5.0,
}
# --- Recommendation Phrasing Lists (for variety) ---
TIPS = {
    'HIGH_DMG_LOW_KILLS': [
        "💥 High damage but low kills. You're winning fights but not securing them. Focus on confirming your knockdowns.",
        "💥 Great damage output! Work with your team to turn those engagements into confirmed kills.",
        "💥 You're a damage-dealing machine! Focus on converting those knockdowns into confirmed kills.",
    ],
    'LOW_COMBAT_IMPACT': [
        "📉 Your combat engagement seems low. Try to take more advantageous fights to build confidence and skill.",
        "📉 Combat stats are low. Focus on positioning; a good angle is more important than a fast reflex.",
        "📉 Low kills and damage. Consider practicing in TDM or hot drops to improve your gunfighting mechanics."
    ],
    'POOR_PLACEMENT': [
        "Survival is key. Analyze your early game rotations. Are you dying in the first 5 minutes?",
        "A poor placement. Review your map strategy and where you choose to rotate through.",
    ],
    'GOOD_SUPPORT': [
        "❤️ Excellent team support! Your revives and assists were critical to the team's success.",
        "❤️ You're a valuable teammate. High support stats are the backbone of a winning squad.",
        "❤️ Excellent team play! Your revives and assists made a significant difference.",
    ],
    'LOW_SUPPORT': [
        "🤝 Try to maintain a 50-100m distance from your teammates to provide effective covering fire and revives.",
        "🤝 Your teamplay stats are low. Focus on communication and staying closer to your squad.",
    ],
    'AGGRESSIVE_SUCCESS': [
        "🏆 Dominant performance! Your high kill and damage stats show excellent combat skill.",
        "🏆 Top-tier fragging! Your aggressive playstyle is paying off. Keep it up.",
        "🏆 You are a force to be reckoned with. Excellent combat effectiveness."
    ],
    'PASSIVE_WIN': [
        "🍗 A win is a win! You showed great survival skills, but consider if more safe engagements were possible to boost your combat score.",
    ]
}

def generate_recommendations(stats, is_overall=False):
    recs = []
    t = THRESHOLDS # Alias for easier access

    # --- PER-MATCH ANALYSIS ---
    if not is_overall:
        kills = stats.get('kills', 0)
        damage = stats.get('damage', 0)
        assists = stats.get('assists', 0)
        revives = stats.get('revives', 0)
        rank = stats.get('team_rank', 99)
        rating = stats.get('rating', 0)
        survival_sec = stats.get('survival_time_sec', 0)

        # Combat
        if damage >= t['high_damage'] and kills >= t['high_kills']:
            recs.append(random.choice(TIPS['AGGRESSIVE_SUCCESS']))
        elif damage >= t['high_damage'] and kills < t['low_kills']:
            recs.append(random.choice(TIPS['HIGH_DMG_LOW_KILLS']))
        elif damage <= t['low_damage'] and kills <= t['low_kills'] and survival_sec < t['short_survival_sec']:
            recs.append(random.choice(TIPS['LOW_COMBAT_IMPACT']))
        
        # Survival
        if rank == 1:
            if kills < t['low_kills']:
                recs.append(random.choice(TIPS['PASSIVE_WIN']))
            else:
                recs.append("🍗 Winner Winner Chicken Dinner! A perfect all-around match.")
        elif rank >= t['poor_rank']:
            recs.append(random.choice(TIPS['POOR_PLACEMENT']))
        
        # Teamplay
        if revives >= t['high_revives'] or assists >= t['high_assists']:
            recs.append(random.choice(TIPS['GOOD_SUPPORT']))
        elif revives == 0 and assists < 1 and rank > t['good_rank']:
            recs.append(random.choice(TIPS['LOW_SUPPORT']))
            
        # Rating
        if rating >= t['high_rating']:
            recs.append(f"⭐ A {rating} rating is outstanding. You dominated this match.")

    # --- OVERALL DASHBOARD ANALYSIS ---
    else:
        avg_kills = stats.get('avg_kills', 0)
        win_rate = stats.get('win_rate', 0)
        
        if avg_kills >= t['avg_high_kills']:
            recs.append(f"📈 Your average of {avg_kills} kills is excellent. You are a consistent fragger.")
        elif avg_kills <= t['avg_low_kills']:
            recs.append(f"📊 Your average of {avg_kills} kills is low. Focus on improving aim and advantageous fights.")

        if win_rate >= t['avg_good_winrate']:
            recs.append(f"🏆 A {win_rate}% win rate is exceptional. Your strategies are clearly working.")
        elif win_rate <= t['avg_poor_winrate']:
             recs.append(f"📉 A {win_rate}% win rate is low. Focus on late-game rotations and placement.")

    if not recs:
        recs.append("📊 A solid, consistent performance. Keep reviewing your gameplay for small optimizations.")
        
    return list(set(recs))[:3] # Return up to 3 unique recommendations