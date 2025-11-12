from flask import current_app
from flask_mailman import EmailMessage
from flask import render_template_string
import os

def send_email(to_email: str, subject: str, template: str, data: dict):
    """Gửi email sử dụng template"""
    try:
        template_content = f"""
        <!doctype html>
        <html lang="vi">
        <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Thông báo từ Camera Store</title>
        <style>
            body {{
            background:#f4f6f8;
            font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial;
            margin:0;
            padding:24px;
            color:#333;
            }}
            .wrapper {{
            max-width:500px;
            margin:0 auto;
            background:#ffffff;
            border-radius:10px;
            box-shadow:0 4px 18px rgba(0,0,0,0.08);
            overflow:hidden;
            }}
            .header {{
            background:#0f62fe;
            color:#fff;
            padding:18px;
            text-align:center;
            font-size:18px;
            font-weight:700;
            }}
            .content {{
            padding:20px;
            line-height:1.6;
            font-size:15px;
            }}
            .box {{
            background:#f1f5f9;
            border-radius:8px;
            padding:14px;
            margin-top:12px;
            }}
            .item {{
            margin:6px 0;
            font-weight:600;
            }}
            .reason {{
            color:#d04848;
            font-weight:700;
            }}
            .footer {{
            text-align:center;
            font-size:12px;
            color:#778;
            padding:18px;
            }}
        </style>
        </head>
        <body>

        <div class="wrapper">
            <div class="header">
            Thông báo từ Camera Shop
            </div>

            <div class="content">
            Xin chào,<br/>
            Dưới đây là thông tin liên quan đến đơn hàng của bạn:
            <div class="box">
                <div class="item">Mã đơn hàng: <strong>{data.get('ma_don_hang', '')}</strong></div>
                <div class="item reason">Lý do: {data.get('ly_do', '')}</div>
            </div>
            </div>

            <div class="footer">
            Camera Shop — Cảm ơn bạn đã sử dụng dịch vụ.
            </div>
        </div>

        </body>
        </html>
        """

        
        msg = EmailMessage(
            subject=subject,
            body=template_content,
            from_email=current_app.config['MAIL_DEFAULT_SENDER'],
            to=[to_email],
        )
        msg.content_subtype = "html"
        msg.send()
        
        return True
    except Exception as e:
        print(f"Lỗi gửi email: {e}")
        return False