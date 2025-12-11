import { Contact } from '../Models/Contact.mjs';
import transporter from '../Config/emailConfig.mjs';

export const contactController = {
  // Submit contact form
  submitContact: async (req, res) => {
    try {
      const { name, email, phone, subject, message } = req.body;

      // Create contact instance
      const contact = new Contact(name, email, phone, subject, message);

      // Validate contact data
      const validation = contact.validate();
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      // Prepare email options
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        replyTo: contact.email,
        subject: `New Contact: ${contact.getSubjectText()}`,
        html: contact.toEmailHTML()
      };

      // Send email
      await transporter.sendMail(mailOptions);

      // Log the submission (you can save to database here)
      console.log('📨 Contact form submitted:', {
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        timestamp: contact.timestamp
      });

      // Success response
      res.status(200).json({
        success: true,
        message: 'Message sent successfully! We will get back to you soon.',
        data: {
          name: contact.name,
          email: contact.email,
          subject: contact.subject
        }
      });

    } catch (error) {
      console.error('❌ Error sending email:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to send message. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Test email configuration
  testEmail: async (req, res) => {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: '✅ Email Configuration Test - Luxury Stay',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="color: #1D293D;">✅ Email Test Successful!</h1>
              <p style="color: #555; font-size: 16px;">Your email configuration is working perfectly.</p>
              <p style="color: #777; font-size: 14px;">Timestamp: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({
        success: true,
        message: 'Test email sent successfully! Check your inbox.'
      });

    } catch (error) {
      console.error('Test email error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: error.message
      });
    }
  }
};