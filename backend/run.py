from app import create_app
from dotenv import load_dotenv
import os

# --- THIS IS THE FIX ---
# Find the .env file in the same directory as this script
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
else:
    print("WARNING: .env file not found. Please create one with your secret keys.")
# --- END FIX ---

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)