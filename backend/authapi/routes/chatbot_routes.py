from flask import Blueprint, request, jsonify
import requests
import os

chatbot_bp = Blueprint('chatbot', __name__)

@chatbot_bp.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        messages = data.get('messages', [])
        
        # Get Groq API key from environment
        api_key = os.getenv('GROQ_API_KEY')
        if not api_key:
            return jsonify({
                'success': False,
                'error': 'GROQ_API_KEY not configured'
            }), 500
        
        # Call Groq API
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'llama-3.1-8b-instant',  # Fast and free model
                'messages': messages,
                'max_tokens': 1000,
                'temperature': 0.7
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            return jsonify({
                'success': True,
                'message': result['choices'][0]['message']['content']
            })
        else:
            return jsonify({
                'success': False,
                'error': f'Groq API error: {response.status_code}'
            }), response.status_code
            
    except Exception as e:
        print(f'[ERROR] Chat error: {str(e)}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
