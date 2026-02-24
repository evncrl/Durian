from flask import Blueprint, request, jsonify, current_app
bp = Blueprint('transaction', __name__)

from utils.pdf_utils import generate_receipt_pdf  # returns BytesIO
import uuid
from handlers.email_handler import send_checkout_email

@bp.route("/checkout", methods=["POST"])
def checkout():
    data = request.json
    print(f"DEBUG: Received data -> {data}")
    email = data.get('email')
    items = data.get('items')
    total = data.get('total')
    address = data.get('address')
    phone = data.get('phone')
    payment_method = data.get('paymentMethod')

    if not email or not items or total is None:
        return jsonify({"error": "Missing data"}), 400

    try:
        transaction_id = str(uuid.uuid4())
        pdf_bytes = generate_receipt_pdf(items, total, transaction_id)

        # Send email via Mailtrap using custom handler
        sent = send_checkout_email(
            user_email=email,
            user_name=email,
            items=items,
            total=total,
            transaction_id=transaction_id,
            pdf_bytes=pdf_bytes,
            address=address,
            phone=phone,
            payment_method=payment_method
        )

        if not sent:
            raise Exception("Failed to send checkout email")

        return jsonify({
            "success": True,
            "transaction_id": transaction_id,
            "amount": total,
            "email": email
        })

    except Exception as e:
        print("Checkout error:", str(e))
        return jsonify({"success": False, "message": str(e)}), 500