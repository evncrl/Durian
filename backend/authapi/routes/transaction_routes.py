from flask import Blueprint, request, jsonify, current_app
import uuid
import datetime # ✅ Import para sa timestamp
from db import orders_collection # ✅ IMPORT MO ITO PARA MA-SAVE SA DB
from utils.pdf_utils import generate_receipt_pdf
from handlers.email_handler import send_checkout_email

bp = Blueprint('transaction', __name__)

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
        
        # --- 💾 STEP 1: SAVE TO DATABASE ---
        # Dito natin ilalagay sa MongoDB para makita sa Admin Panel
        order_payload = {
            "transaction_id": transaction_id,
            "email": email,
            "items": items,
            "total": total,
            "address": address,
            "phone": phone,
            "paymentMethod": payment_method,
            "status": "Pending", # Default status para sa Admin Manage
            "created_at": datetime.datetime.utcnow().isoformat() # ✅ Standard underscore format
        }
        
        # Pagka-execute nito, automatic na gagawa si MongoDB ng "orders" collection
        orders_collection.insert_one(order_payload)
        print(f"[DB] Order saved successfully for: {email}")

        # --- 📧 STEP 2: GENERATE RECEIPT & SEND EMAIL ---
        pdf_bytes = generate_receipt_pdf(items, total, transaction_id)
        
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
            print("Warning: Email notification failed, but order was saved to DB.")

        return jsonify({
            "success": True,
            "transaction_id": transaction_id,
            "amount": total,
            "email": email
        })

    except Exception as e:
        print("Checkout error:", str(e))
        return jsonify({"success": False, "message": str(e)}), 500