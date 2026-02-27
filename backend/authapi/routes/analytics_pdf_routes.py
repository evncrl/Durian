import pdfkit
from flask import Blueprint, render_template, make_response, jsonify
import requests
from datetime import datetime
import matplotlib.pyplot as plt
import io
import base64
import matplotlib
import pandas as pd

matplotlib.use('Agg')

analytics_pdf_bp = Blueprint("analytics_pdf", __name__)

PATH_WKHTMLTOPDF = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'
config = pdfkit.configuration(wkhtmltopdf=PATH_WKHTMLTOPDF)


def safe_encode_plot(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format='png', dpi=120, bbox_inches='tight')
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.getvalue()).decode('utf-8')


# =========================
# WEEKLY BAR CHART (Color-coded bars)
# =========================
def generate_weekly_chart(weekly_data):
    if not weekly_data:
        return None

    try:
        dates = [d['date'][-5:] for d in weekly_data]
        counts = [d.get('scans', 0) for d in weekly_data]

        colors = ['#27AE60', '#2ecc71', '#1abc9c', '#16a085', '#3498db', '#9b59b6', '#e67e22']

        fig, ax = plt.subplots(figsize=(8, 3))
        bars = ax.bar(dates, counts)

        for i, bar in enumerate(bars):
            bar.set_color(colors[i % len(colors)])

        ax.set_title('Scan Activity Trends', fontsize=13, fontweight='bold')
        ax.set_ylabel('Number of Scans')
        ax.set_xlabel('Date')

        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.grid(axis='y', linestyle='--', alpha=0.3)

        plt.xticks(rotation=45)
        plt.tight_layout()
        return safe_encode_plot(fig)

    except Exception as e:
        print(f"Weekly Chart Error: {e}")
        return None


# =========================
# QUALITY PIE CHART (More colorful)
# =========================
def generate_pie_chart(data_list):
    if not data_list or sum(d.get('count', 0) for d in data_list) == 0:
        return None

    try:
        labels = [d['range'] for d in data_list]
        sizes = [d.get('count', 0) for d in data_list]

        colors = ['#27AE60', '#2ecc71', '#f1c40f', '#e74c3c', '#3498db']

        fig, ax = plt.subplots(figsize=(5, 4))
        ax.pie(
            sizes,
            labels=labels,
            autopct=lambda p: f'{p:.1f}%' if p > 0 else '',
            startangle=140,
            colors=colors,
            pctdistance=0.8
        )

        centre_circle = plt.Circle((0, 0), 0.65, fc='white')
        ax.add_artist(centre_circle)

        ax.set_title('Quality Distribution', fontsize=13, fontweight='bold')
        ax.axis('equal')

        plt.tight_layout()
        return safe_encode_plot(fig)

    except Exception as e:
        print(f"Pie Chart Error: {e}")
        return None


# =========================
# RECENT SCAN LINE CHART (Color-coded line + markers)
# =========================
def generate_recent_scan_chart(recent_scans):
    if not recent_scans:
        return None

    try:
        df = pd.DataFrame(recent_scans)

        if 'date' in df.columns:
            df['scan_date'] = pd.to_datetime(df['date'], errors='coerce')
        elif 'created_at' in df.columns:
            df['scan_date'] = pd.to_datetime(df['created_at'], errors='coerce')
        else:
            return None

        df = df.dropna(subset=['scan_date', 'quality'])
        if df.empty:
            return None

        df.sort_values('scan_date', inplace=True)
        df['date_label'] = df['scan_date'].dt.strftime('%b %d')

        fig, ax = plt.subplots(figsize=(8, 3))

        ax.plot(
            df['date_label'],
            df['quality'],
            marker='o',
            linewidth=2.5,
            color='#e67e22'
        )

        ax.fill_between(
            df['date_label'],
            df['quality'],
            color='#f9e79f',
            alpha=0.3
        )

        ax.set_title('Recent Scan Quality Trend', fontsize=13, fontweight='bold')
        ax.set_xlabel('Date')
        ax.set_ylabel('Quality Score')
        ax.grid(True, linestyle='--', alpha=0.4)

        plt.xticks(rotation=45)
        plt.tight_layout()

        return safe_encode_plot(fig)

    except Exception as e:
        print(f"Recent Scan Chart Error: {e}")
        return None


# =========================
# MAIN ROUTE
# =========================
@analytics_pdf_bp.route("/analytics/pdf/<user_id>")
def download_analytics_pdf(user_id):

    analytics_url = f"http://localhost:8000/scanner/analytics/{user_id}?time_range=month"

    try:
        response = requests.get(analytics_url)
        data = response.json()
    except Exception as e:
        print(f"Fetch analytics error: {e}")
        return jsonify({"error": "Failed to fetch analytics"}), 500

    stats = data.get("stats", {})
    weekly_data = data.get("weekly_data", [])
    quality_distribution = data.get("quality_distribution", [])
    recent_scans = data.get("recent_scans", [])

    for scan in recent_scans:
        if scan.get("date"):
            scan["formatted_date"] = scan["date"]
        elif scan.get("created_at"):
            try:
                dt = datetime.fromisoformat(scan["created_at"])
                scan["formatted_date"] = dt.strftime("%Y-%m-%d")
            except:
                scan["formatted_date"] = scan["created_at"]
        else:
            scan["formatted_date"] = "N/A"

    report_data = {
        "generated_at": datetime.now().strftime('%m/%d/%Y, %I:%M %p'),
        "stats": stats,
        "weekly_data": weekly_data,
        "quality_distribution": quality_distribution,
        "recent_scans": recent_scans,
        "weekly_chart": generate_weekly_chart(weekly_data),
        "dist_chart": generate_pie_chart(quality_distribution),
        "recent_chart": generate_recent_scan_chart(recent_scans)
    }

    html = render_template('durian_report_template.html', data=report_data)

    options = {
        'page-size': 'A4',
        'encoding': "UTF-8",
        'enable-local-file-access': None
    }

    pdf = pdfkit.from_string(html, False, configuration=config, options=options)

    response = make_response(pdf)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = f'attachment; filename=durian_report_{user_id}.pdf'

    return response