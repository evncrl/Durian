import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))  # adds backend/ to path

from flask import Flask, request, jsonify

from flask_cors import CORS

import datetime

from flask_mail import Mail
import os
from dotenv import load_dotenv
from routes.forum_routes import forum_bp

from routes.profile_routes import profile_bp

from routes.auth_routes import auth_bp

from routes.admin.admin_routes import admin_bp

from routes.scanner_routes import scanner_bp
from routes.chatbot_routes import chatbot_bp
from routes.shop_routes import shop_bp
from routes.transaction_routes import bp as transaction_bp

load_dotenv()

app = Flask(__name__)
CORS(app)

# Allow ALL origins for ngrok testing

CORS(app, resources={r"/*": {"origins": "*"}})

# Register Blueprints

app.register_blueprint(forum_bp, url_prefix='/forum')
app.register_blueprint(profile_bp, url_prefix='/profile')
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(admin_bp, url_prefix='/admin')
app.register_blueprint(scanner_bp, url_prefix='/scanner')
app.register_blueprint(chatbot_bp, url_prefix='/chatbot')
app.register_blueprint(shop_bp, url_prefix='/shop')
app.register_blueprint(transaction_bp)


# Mail setup
app.config['MAIL_SERVER'] = os.getenv("MAIL_HOST")
app.config['MAIL_PORT'] = int(os.getenv("MAIL_PORT", 25))
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")
app.config['MAIL_DEFAULT_SENDER'] = (
    os.getenv("MAIL_FROM_NAME", "DurianSupport"),
    os.getenv("MAIL_FROM_ADDRESS", "duriansupport@durianapp.com")
)

# Initialize Mail
mail = Mail()
mail.init_app(app)

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

    # Only add CORS headers if not already set by flask-cors

    if 'Access-Control-Allow-Origin' not in response.headers:

        response.headers.add('Access-Control-Allow-Origin', '*')

    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,X-Requested-With,ngrok-skip-browser-warning,X-User-Id'

    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'

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

    print("  ⚙️  Admin: /admin/*")

    print("  📷 Scanner: /scanner/*")

    print("  ❤️  Health: /health")

    app.run(debug=True, host="0.0.0.0", port=8000)