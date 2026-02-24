from flask import Blueprint, request, jsonify, current_app
from flask_mail import Message
from utils.pdf_utils import generate_receipt_pdf  # returns BytesIO
import uuid

# Do NOT import mail from app here. It causes the crash.

bp = Blueprint('transaction', __name__)

@bp.route("/checkout", methods=["POST"])
def checkout():

    data = request.json
    print(f"DEBUG: Received data -> {data}")
    email = data.get('email')
    items = data.get('items')
    total = data.get('total')

    if not email or not items or total is None:
        return jsonify({"error": "Missing data"}), 400

    try:
        # 1️⃣ Generate a unique transaction ID
        transaction_id = str(uuid.uuid4())
    
        # 2️⃣ Generate PDF
        pdf_buffer = generate_receipt_pdf(items, total, transaction_id)
        
        # IMPORTANT: Ensure buffer is at the start before reading
        pdf_buffer.seek(0)

        # 3️⃣ Prepare email
        msg = Message(
            subject="Your DurianApp Order Receipt",
            recipients=[email],
            body=f"Thank you for your purchase! Your receipt (Transaction ID: {transaction_id}) is attached."
        )

        # 4️⃣ Attach PDF
        msg.attach("receipt.pdf", "application/pdf", pdf_buffer.getvalue())

        # 5️⃣ Send email using the mail extension registered to the app
        mail = current_app.extensions.get("mail")
        if not mail:
            raise Exception("Mail extension not initialized on the app")
        
        mail.send(msg)

        # 6️⃣ Return success
        return jsonify({
            "success": True,
            "transaction_id": transaction_id,
            "amount": total,
            "email": email
        })

    except Exception as e:
        print("Checkout error:", str(e))
        return jsonify({"success": False, "message": str(e)}), 500