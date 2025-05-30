from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import sqlite3
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Langflow configuration
LANGFLOW_URL = os.getenv('LANGFLOW_URL', 'http://localhost:7860')
FLOW_ID = os.getenv('FLOW_ID', 'your-flow-id-here')

class ChatDatabase:
    def __init__(self, db_path='chat_history.db'):
        self.db_path = db_path
        self.init_db()
    
    def init_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                user_message TEXT,
                ai_response TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        conn.close()
    
    def save_conversation(self, session_id, user_message, ai_response):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO chat_history (session_id, user_message, ai_response)
            VALUES (?, ?, ?)
        ''', (session_id, user_message, ai_response))
        conn.commit()
        conn.close()
    
    def get_chat_history(self, limit=100):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM chat_history 
            ORDER BY timestamp DESC 
            LIMIT ?
        ''', (limit,))
        results = cursor.fetchall()
        conn.close()
        return results

db = ChatDatabase()

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        session_id = data.get('session_id', 'default')
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Call Langflow API
        langflow_payload = {
            "input_value": user_message,
            "input_type": "chat",
            "output_type": "chat"
        }
        
        response = requests.post(
            f"{LANGFLOW_URL}/api/v1/run/{FLOW_ID}",
            json=langflow_payload,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            ai_response = response.json().get('outputs', [{}])[0].get('outputs', [{}])[0].get('results', {}).get('message', {}).get('text', 'No response')
        else:
            ai_response = "Sorry, I'm having trouble processing your request right now."
        
        # Save to database
        db.save_conversation(session_id, user_message, ai_response)
        
        return jsonify({
            'response': ai_response,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/history', methods=['GET'])
def get_chat_history():
    try:
        history = db.get_chat_history()
        formatted_history = []
        for row in history:
            formatted_history.append({
                'id': row[0],
                'session_id': row[1],
                'user_message': row[2],
                'ai_response': row[3],
                'timestamp': row[4]
            })
        return jsonify(formatted_history)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)