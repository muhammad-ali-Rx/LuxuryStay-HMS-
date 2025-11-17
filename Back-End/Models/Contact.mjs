import mongoose from "mongoose"; 


export class Contact {
  constructor(name, email, phone, subject, message) {
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.subject = subject;
    this.message = message;
    this.timestamp = new Date();
  }

  validate() {
    const errors = {};

    if (!this.name?.trim()) {
      errors.name = "Name is required";
    } else if (this.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!this.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (this.phone && !/^[\d\s\-+()]+$/.test(this.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    if (!this.subject) {
      errors.subject = "Please select a subject";
    }

    if (!this.message?.trim()) {
      errors.message = "Message is required";
    } else if (this.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  toEmailHTML() {
    const subjectText = this.getSubjectText();
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
            .header { background: #1D293D; color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px; background: #f8f9fa; }
            .field { margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #FF6B35; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .label { font-weight: bold; color: #1D293D; display: block; margin-bottom: 8px; font-size: 14px; }
            .value { color: #555; font-size: 16px; }
            .message-box { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; margin-top: 10px; line-height: 1.8; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #1D293D; color: #777; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 New Contact Form Submission</h1>
              <p>Luxury Stay Resort & Spa</p>
            </div>
            <div class="content">
              <div class="field">
                <span class="label">👤 Name:</span>
                <span class="value">${this.name}</span>
              </div>
              <div class="field">
                <span class="label">📧 Email:</span>
                <span class="value">${this.email}</span>
              </div>
              ${this.phone ? `
              <div class="field">
                <span class="label">📞 Phone:</span>
                <span class="value">${this.phone}</span>
              </div>
              ` : ''}
              <div class="field">
                <span class="label">🎯 Subject:</span>
                <span class="value">${subjectText}</span>
              </div>
              <div class="field">
                <span class="label">💬 Message:</span>
                <div class="message-box">
                  ${this.message.replace(/\n/g, '<br>')}
                </div>
              </div>
              <div class="footer">
                <p>This email was sent from your website contact form</p>
                <p>🕒 Timestamp: ${this.timestamp.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getSubjectText() {
    const subjects = {
      reservation: '🏨 Reservation Inquiry',
      dining: '🍽️ Dining Reservation',
      event: '🎉 Event Booking',
      feedback: '💫 Feedback',
      other: '❓ Other Inquiry'
    };
    return subjects[this.subject] || 'General Inquiry';
  }
}