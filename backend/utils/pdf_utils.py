from fpdf import FPDF
from io import BytesIO

def generate_receipt_pdf(items, total, transaction_id):
    """
    Generates a PDF receipt using fpdf2.
    Matches the 3 arguments sent by transaction_routes.py
    """
    # Create the PDF object
    pdf = FPDF()
    pdf.add_page()
    
    # 1. Title
    pdf.set_font("helvetica", "B", 16)
    pdf.cell(0, 10, "Durian App Receipt", ln=True, align="C")
    pdf.ln(10)
    
    # 2. Transaction Info
    pdf.set_font("helvetica", "", 10)
    pdf.cell(0, 10, f"Transaction ID: {transaction_id}", ln=True)
    pdf.ln(5)
    
    # 3. Table Header
    pdf.set_font("helvetica", "B", 12)
    pdf.set_fill_color(240, 240, 240)  # Light gray background for header
    pdf.cell(90, 10, "Item", 1, 0, "C", True)
    pdf.cell(30, 10, "Qty", 1, 0, "C", True)
    pdf.cell(70, 10, "Total", 1, 1, "C", True)
    
    # 4. Table Rows
    pdf.set_font("helvetica", "", 12)
    for item in items:
        name = item.get('name', 'Unknown Product')
        qty = item.get('quantity', 1)
        price = item.get('price', 0)
        
        pdf.cell(90, 10, f" {name}", 1)
        pdf.cell(30, 10, str(qty), 1, 0, "C")
        pdf.cell(70, 10, f"P{price * qty}", 1, 1, "R")
    
    # 5. Grand Total
    pdf.ln(10)
    pdf.set_font("helvetica", "B", 14)
    pdf.cell(0, 10, f"Grand Total: P{total}  ", ln=True, align="R")
    
    # 6. Output to BytesIO
    buffer = BytesIO()
    # fpdf2's output() can return bytes directly
    pdf_bytes = pdf.output() 
    buffer.write(pdf_bytes)
    buffer.seek(0)
    
    return buffer