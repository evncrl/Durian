from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

from routes.forum_routes import forum_bp
from routes.profile_routes import profile_bp
from routes.auth_routes import auth_bp
from routes.chatbot_routes import chatbot_bp

app = Flask(__name__)

# Allow ALL origins for ngrok testing
CORS(app, resources={r"/*": {"origins": "*"}})

# Register Blueprints
app.register_blueprint(forum_bp, url_prefix='/forum')
app.register_blueprint(profile_bp, url_prefix='/profile')
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(chatbot_bp, url_prefix='/chatbot')

# ---------------------------
# Core App Routes
# ---------------------------

@app.route("/health", methods=["GET"])
def health():
    """Simple health check"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "endpoints": {
            "auth": "/auth/*",
            "profile": "/profile/*", 
            "forum": "/forum/*"
        }
    })

# Handle CORS preflight requests
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,ngrok-skip-browser-warning')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

@app.route("/", methods=["GET", "OPTIONS"])
def home():
    if request.method == "OPTIONS":
        return '', 200
    return jsonify({
        "message": "Durian App API",
        "version": "2.0.0",
        "endpoints": {
            "auth": "/auth/*",
            "profile": "/profile/*",
            "forum": "/forum/*"
        }
    })

@app.route("/status", methods=["GET", "OPTIONS"])
def status():
    return jsonify({
        "message": "Auth API is running!",
        "version": "2.0.0",
        "endpoints": {
            "auth": "/auth/* (signup, login, signup-with-pfp)",
            "profile": "/profile/* (get, update, update-pfp)",
            "forum": "/forum/* (posts, comments)"
        }
    })

# ---------------------------
# Error Handlers
# ---------------------------

@app.errorhandler(404)
def not_found(error):
    return jsonify({"success": False, "error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"success": False, "error": "Internal server error"}), 500

# ---------------------------
# Run App
# ---------------------------

if __name__ == "__main__":
    print("🚀 Starting Durian App API v2.0.0")
    print("📋 Available endpoints:")
    print("  🔐 Auth: /auth/*")
    print("  👤 Profile: /profile/*")
    print("  💬 Forum: /forum/*")
    print("  ❤️  Health: /health")
    app.run(debug=True, host="0.0.0.0", port=8000)