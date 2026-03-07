from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable, PageBreak
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import io
import datetime

def draw_header(canvas, doc):
    """Repeating header logic for every page"""
    canvas.saveState()
    canvas.setFont('Helvetica-Bold', 10)
    canvas.drawCentredString(letter[0]/2, letter[1] - 25, "DURIANOSTICS: Official Analytics Report")
    canvas.setFont('Helvetica-Oblique', 8)
    canvas.drawCentredString(letter[0]/2, letter[1] - 35, "AI-Powered Durian Quality Assurance System")
    canvas.drawRightString(letter[0] - 40, letter[1] - 35, f"Page {doc.page}")
    canvas.setStrokeColor(colors.lightgrey)
    canvas.setLineWidth(0.5)
    canvas.line(40, letter[1] - 40, letter[0] - 40, letter[1] - 40)
    canvas.restoreState()

def generate_analytics_pdf(data):
    """Generates a professional PDF report with date-only timestamps for consistency"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=50, bottomMargin=40)
    styles = getSampleStyleSheet()
    elements = []

    primary_color = colors.HexColor("#A0522D") 
    text_dark = colors.HexColor("#1A1A1A")
    bg_light = colors.HexColor("#F8F9FA")
    border_color = colors.HexColor("#E2E8F0")
    
    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=24, textColor=primary_color, spaceAfter=5)
    sub_style = ParagraphStyle('SubStyle', parent=styles['Normal'], fontSize=10, textColor=colors.grey, spaceAfter=20)
    section_title = ParagraphStyle('SectionTitle', parent=styles['Heading2'], fontSize=16, textColor=text_dark, spaceBefore=20, spaceAfter=5)
    desc_style = ParagraphStyle('DescStyle', parent=styles['Normal'], fontSize=9, textColor=colors.HexColor("#666666"), italic=True, spaceAfter=12)
    card_value_style = ParagraphStyle('CardValue', parent=styles['Normal'], fontSize=16, textColor=text_dark, alignment=1, fontName='Helvetica-Bold')
    
    insight_style = ParagraphStyle('InsightStyle', parent=styles['Normal'], fontSize=10, textColor=text_dark, leading=14, spaceBefore=10, spaceAfter=10)

    elements.append(Paragraph("DURIANOSTICS REPORT", title_style))
    # ✅ UPDATED: Inalis ang time sa generation date
    elements.append(Paragraph(f"Generated on: {datetime.datetime.now().strftime('%B %d, %Y')}", sub_style))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=20))

    elements.append(Paragraph("Executive Summary", section_title))
    elements.append(Paragraph("A quick overview of total platform activity and AI model performance metrics.", desc_style))
    
    def make_tile(val, label):
        return Table([[Paragraph(f"<b>{val}</b><br/><font size='8' color='grey'>{label}</font>", card_value_style)]],
                     colWidths=[1.4*inch], rowHeights=[0.8*inch],
                     style=[('BACKGROUND', (0,0), (-1,-1), colors.white),
                            ('BOX', (0,0), (-1,-1), 1, border_color),
                            ('VALIGN', (0,0), (-1,-1), 'MIDDLE')])

    summary_tiles = [
        [make_tile(data['totalUsers'], "TOTAL USERS"), 
         make_tile(data['totalScans'], "TOTAL SCANS"), 
         make_tile(data['totalPosts'], "FORUM POSTS")],
        [make_tile(f"{data['successRate']}%", "ACCURACY"), 
         make_tile(f"{data['avgConfidence']}%", "AVG CONFIDENCE"), 
         ""]
    ]
    
    summary_table = Table(summary_tiles, colWidths=[2.3*inch, 2.3*inch, 2.3*inch])
    summary_table.setStyle(TableStyle([('ALIGN', (0, 0), (-1, -1), 'CENTER'), ('BOTTOMPADDING', (0,0), (-1,-1), 10)]))
    elements.append(summary_table)

    elements.append(Paragraph("AI Classification Breakdown", section_title))
    elements.append(Paragraph("Distribution of detected durian characteristics used for grading and quality assessment.", desc_style))
    
    def create_bar_table(label, count, total, color):
        pct = (count / total) if total > 0 else 0
        bar_width = pct * 1.5 * inch
        return [
            Paragraph(f"<font size='9' color='#444444'>{label}</font>", styles['Normal']),
            Table([[ "" ]], colWidths=[max(bar_width, 1)], rowHeights=[8], style=[('BACKGROUND', (0,0), (-1,-1), colors.HexColor(color))]),
            Paragraph(f"<b>{count}</b>", styles['Normal'])
        ]

    dist = data['distribution']
    total_s = data['totalScans']
    
    class_grid_data = [
        [Paragraph("<b>Color Distribution</b>", styles['Normal']), Paragraph("<b>Health & Diseases</b>", styles['Normal'])],
        [Table([create_bar_table("Greenish", dist['color']['Greenish'], total_s, "#2e7d32"),
                create_bar_table("Brownish", dist['color']['Brownish'], total_s, "#8d6e63")], colWidths=[0.8*inch, 1.6*inch, 0.4*inch]),
         Table([create_bar_table("Healthy", dist['diseases']['Healthy'], total_s, "#4caf50"),
                create_bar_table("Mold", dist['diseases']['Mold'], total_s, "#78909c"),
                create_bar_table("Rot", dist['diseases']['Rot'], total_s, "#d32f2f")], colWidths=[0.8*inch, 1.6*inch, 0.4*inch])],
        [Spacer(1, 15), Spacer(1, 15)],
        [Paragraph("<b>Size Classification</b>", styles['Normal']), Paragraph("<b>Shape Classification</b>", styles['Normal'])],
        [Table([create_bar_table("Large", dist['size']['Large'], total_s, "#3f51b5"),
                create_bar_table("Medium", dist['size']['Medium'], total_s, "#5c6bc0"),
                create_bar_table("Small", dist['size']['Small'], total_s, "#9fa8da")], colWidths=[0.8*inch, 1.6*inch, 0.4*inch]),
         Table([create_bar_table("Elongated", dist['shape']['Elongated'], total_s, "#009688"),
                create_bar_table("Irregular", dist['shape']['Irregular'], total_s, "#4db6ac"),
                create_bar_table("Round", dist['shape']['Round'], total_s, "#b2dfdb")], colWidths=[0.8*inch, 1.6*inch, 0.4*inch])]
    ]
    elements.append(Table(class_grid_data, colWidths=[3.6*inch, 3.6*inch]))
    
    elements.append(Paragraph("<b>AI Classification:</b> Distribution metrics identify harvest quality trends where 'Healthy' and 'Greenish' detections serve as the primary indicators for export-grade durian standards.", insight_style))

    elements.append(PageBreak())
    elements.append(Paragraph("Marketplace Performance", section_title))
    elements.append(Paragraph("Sales data monitoring top-performing products and most frequent buyers.", desc_style))

    sales_header = [["TOP SELLING PRODUCTS", "SOLD", "RATING", "", "TOP BUYERS", "ORDERS"]]
    sales_rows = []
    for i in range(5):
        prod = data['topProducts'][i] if i < len(data['topProducts']) else {"name": "-", "sold": "-", "rating": "-"}
        buyer = data['topBuyers'][i] if i < len(data['topBuyers']) else {"name": "-", "count": "-"}
        rating_str = f"{prod['rating']} ★" if prod['rating'] != "-" else "-"
        sales_rows.append([prod['name'], prod['sold'], rating_str, "", buyer['name'], buyer['count']])

    elements.append(Table(sales_header + sales_rows, colWidths=[1.6*inch, 0.6*inch, 0.8*inch, 0.4*inch, 2.0*inch, 0.8*inch],
                         style=[('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'), ('BACKGROUND', (0, 0), (2, 0), colors.HexColor("#F1F5F9")),
                                ('BACKGROUND', (4, 0), (5, 0), colors.HexColor("#DCFCE7")), ('LINEBELOW', (0, 0), (-1, -1), 0.5, border_color),
                                ('ALIGN', (1, 0), (2, -1), 'CENTER'), ('ALIGN', (5, 0), (5, -1), 'CENTER'), ('FONTSIZE', (0, 0), (-1, -1), 9)]))
    
    elements.append(Paragraph("<b>Marketplace Performance:</b> Sales volume and feedback identify high-demand variants and verify market retention levels essential for platform inventory forecasting.", insight_style))

    elements.append(Spacer(1, 30))
    elements.append(Paragraph("Community Engagement", section_title))
    
    lead_header = [["TOP SCANNERS", "SCANS", "", "TOP POSTERS", "POSTS"]]
    lead_rows = []
    for i in range(5):
        s = data['topScanners'][i] if i < len(data['topScanners']) else {"name": "-", "count": "-"}
        p = data['topPosters'][i] if i < len(data['topPosters']) else {"name": "-", "count": "-"}
        lead_rows.append([s['name'], s['count'], "", p['name'], p['count']])
    
    elements.append(Table(lead_header + lead_rows, colWidths=[2.0*inch, 0.7*inch, 0.4*inch, 2.0*inch, 0.7*inch],
                         style=[('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'), ('BACKGROUND', (0, 0), (1, 0), colors.HexColor("#DCFCE7")),
                                ('BACKGROUND', (3, 0), (4, 0), colors.HexColor("#FEF3C7")), ('LINEBELOW', (0, 0), (-1, -1), 0.5, border_color),
                                ('ALIGN', (1, 0), (1, -1), 'CENTER'), ('ALIGN', (4, 0), (4, -1), 'CENTER')]))
    
    elements.append(Paragraph("<b>Community Engagement:</b> Platform activity reflects a knowledge-sharing ecosystem where active users contribute critical data points for continuous system improvement.", insight_style))

    elements.append(PageBreak()) 
    elements.append(Paragraph("Recent System Activity", section_title))
    elements.append(Paragraph("A chronological log of the latest classifications performed across the entire system.", desc_style))
    
    # ✅ UPDATED: Inalis ang time sa table header
    activity_header = [["USER", "VARIETY", "STATUS", "CONF.", "DATE"]]
    activity_rows = []
    for s in data['recentScans'][:15]: 
        # ✅ UPDATED: Ginamit ang '%b %d, %Y' para maging 'Mar 07, 2026'
        date_str = datetime.datetime.fromisoformat(s['time'].replace('Z', '')).strftime('%b %d, %Y')
        activity_rows.append([s['username'], s['variety'], s['status'], f"{s['confidence']}%", date_str])
    
    elements.append(Table(activity_header + activity_rows, colWidths=[1.6*inch, 1.2*inch, 1.2*inch, 0.8*inch, 1.6*inch],
                         style=[('BACKGROUND', (0, 0), (-1, 0), text_dark), ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                                ('GRID', (0, 0), (-1, -1), 0.2, colors.lightgrey), ('FONTSIZE', (0, 0), (-1, -1), 8), ('BOTTOMPADDING', (0, 0), (-1, -1), 8)]))
    
    elements.append(Paragraph("<b>Recent Scans:</b> The activity log provides an audit trail used to monitor the operational consistency and field reliability of the durian classification engine.", insight_style))

    doc.build(elements, onFirstPage=draw_header, onLaterPages=draw_header)
    buffer.seek(0)
    return buffer