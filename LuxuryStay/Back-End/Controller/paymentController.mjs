import Booking from '../Models/Booking.mjs';
import nodemailer from 'nodemailer';

// Create email transporter - FIXED to use EMAIL_PASSWORD
const createTransporter = () => {
  console.log('🔧 Checking email configuration...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ SET' : '❌ MISSING');
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ SET' : '❌ MISSING');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️ Email credentials not configured. Using mock email sending.');
    return null;
  }

  console.log('✅ Creating real email transporter...');
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD  // ✅ FIXED: Using EMAIL_PASSWORD
    },
    pool: true,
    maxConnections: 1,
    maxMessages: 10
  });
};

// Get all bookings for billing
export const getBillingData = async (req, res) => {
  try {
    console.log('📊 Fetching billing data...');
    
    const bookings = await Booking.find()
      .populate('guest', 'name email phone address')
      .populate('room', 'roomNumber roomType price')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    console.log(`📋 Found ${bookings.length} bookings`);

    const billingData = bookings.map(booking => {
      const subtotal = booking.totalAmount || 0;
      const paid = booking.payment?.paidAmount || 0;
      const pending = Math.max(0, subtotal - paid);
      
      let paymentStatus = 'pending';
      if (paid >= subtotal) {
        paymentStatus = 'paid';
      } else if (paid > 0) {
        paymentStatus = 'partially-paid';
      }

      return {
        id: booking._id.toString(),
        type: 'room_booking',
        guestName: booking.guest?.name || booking.guestDetails?.name || 'N/A',
        guestEmail: booking.guest?.email || booking.guestDetails?.email || 'N/A',
        guestPhone: booking.guest?.phone || booking.guestDetails?.phone || 'N/A',
        guestAddress: booking.guest?.address || 'N/A',
        roomNumber: booking.room?.roomNumber || booking.roomNumber || 'N/A',
        roomType: booking.room?.roomType || booking.roomType || 'N/A',
        checkIn: booking.checkInDate ? booking.checkInDate.toISOString().split('T')[0] : 'N/A',
        checkOut: booking.checkOutDate ? booking.checkOutDate.toISOString().split('T')[0] : 'N/A',
        nights: booking.totalNights || 0,
        roomRate: booking.room?.price || (subtotal / (booking.totalNights || 1)),
        subtotal: subtotal,
        paid: paid,
        pending: pending,
        paymentStatus: mapToFrontendStatus(booking.paymentStatus || paymentStatus),
        invoiceDate: booking.createdAt ? booking.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        staff: booking.assignedBy?.name || 'System',
        specialRequests: booking.guestDetails?.specialRequests || 'No special requests',
        originalData: booking
      };
    });

    res.status(200).json({
      success: true,
      data: billingData,
      message: "Billing data fetched successfully"
    });

  } catch (error) {
    console.error("❌ Error fetching billing data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching billing data",
      error: error.message
    });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paidAmount, pendingAmount, notes } = req.body;

    console.log('🔄 Updating payment status:', { id, paymentStatus, paidAmount, pendingAmount });

    const booking = await Booking.findById(id)
      .populate('guest', 'name email')
      .populate('room', 'roomNumber roomType price');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    const oldStatus = booking.paymentStatus;
    booking.paymentStatus = mapToBackendStatus(paymentStatus);
    
    if (!booking.payment) {
      booking.payment = {};
    }
    
    if (paidAmount !== undefined) {
      booking.payment.paidAmount = paidAmount;
      booking.payment.paymentDate = new Date();
    }
    
    if (notes) {
      if (!booking.notes) booking.notes = [];
      booking.notes.push({
        message: notes,
        date: new Date(),
        addedBy: req.user?.email || 'System'
      });
    }

    booking.assignedBy = req.user?._id;
    await booking.save();

    console.log('✅ Payment status updated successfully:', booking._id);

    try {
      await sendPaymentStatusEmail(booking, oldStatus, paymentStatus);
    } catch (emailError) {
      console.warn('⚠️ Email sending failed, but status updated:', emailError.message);
    }

    res.status(200).json({
      success: true,
      message: `Payment status updated to ${paymentStatus} successfully`,
      data: booking
    });

  } catch (error) {
    console.error("❌ Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating payment status",
      error: error.message
    });
  }
};

// Send invoice via email - FIXED VERSION
export const sendInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📧 Sending invoice for ID:', id);
    
    const booking = await Booking.findById(id)
      .populate('guest', 'name email phone address')
      .populate('room', 'roomNumber roomType price');

    if (!booking) {
      console.log('❌ Booking not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    console.log('📋 Booking found for invoice:', {
      id: booking._id,
      guestName: booking.guest?.name,
      guestEmail: booking.guest?.email,
      amount: booking.totalAmount
    });

    const subtotal = booking.totalAmount || 0;
    const paid = booking.payment?.paidAmount || 0;
    const pending = Math.max(0, subtotal - paid);

    // Send email
    await sendInvoiceEmail(
      booking.guest?.email || booking.guestDetails?.email,
      booking.guest?.name || booking.guestDetails?.name,
      {
        id: booking._id.toString(),
        roomNumber: booking.room?.roomNumber || booking.roomNumber,
        roomType: booking.room?.roomType || booking.roomType,
        checkIn: booking.checkInDate ? booking.checkInDate.toISOString().split('T')[0] : 'N/A',
        checkOut: booking.checkOutDate ? booking.checkOutDate.toISOString().split('T')[0] : 'N/A',
        nights: booking.totalNights || 0,
        subtotal: subtotal,
        paid: paid,
        pending: pending,
        paymentStatus: booking.paymentStatus || 'pending'
      }
    );

    console.log('✅ Invoice email sent successfully for:', booking.guest?.email);

    res.status(200).json({
      success: true,
      message: 'Invoice sent successfully to guest email'
    });

  } catch (error) {
    console.error('❌ Error sending invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending invoice email',
      error: error.message
    });
  }
};

// Send invoice email - FIXED to use EMAIL_PASSWORD
const sendInvoiceEmail = async (guestEmail, guestName, invoiceData) => {
  try {
    console.log('📧 Starting email send to:', guestEmail);
    
    const transporter = createTransporter();
    
    if (!transporter) {
      console.warn('⚠️ No email transporter available. Using mock email sending.');
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('📧 Mock email sent to:', guestEmail);
      return { messageId: 'mock-message-id' };
    }

    console.log('✅ Real email transporter available. Sending email via Gmail...');
    
    const mailOptions = {
      from: `"LuxuryStay Hotel" <${process.env.EMAIL_USER}>`,
      to: guestEmail,
      subject: `LuxuryStay Invoice #${invoiceData.id.slice(-8)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; line-height: 1.6; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #0A1F44 0%, #1a365d 100%); color: white; padding: 30px 20px; text-align: center; }
                .content { padding: 30px; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                .amount { font-size: 18px; font-weight: bold; margin: 5px 0; }
                .paid { color: #10B981; }
                .pending { color: #EF4444; }
                .details { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
                .status { display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; }
                .status-paid { background: #D1FAE5; color: #065F46; }
                .status-pending { background: #FEF3C7; color: #92400E; }
                .status-partial { background: #DBEAFE; color: #1E40AF; }
                .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; }
                .invoice-table th, .invoice-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                .invoice-table th { background-color: #0A1F44; color: white; }
                .total-row { background-color: #f8f9fa; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 28px;">LUXURYSTAY</h1>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">Hotel & Resorts</p>
                    <h2 style="margin: 20px 0 0 0; font-size: 22px;">INVOICE #${invoiceData.id.slice(-8).toUpperCase()}</h2>
                </div>
                
                <div class="content">
                    <h3>Dear ${guestName},</h3>
                    <p>Thank you for choosing LuxuryStay. Here are your invoice details:</p>
                    
                    <div class="details">
                        <h4 style="margin-top: 0; color: #0A1F44;">📅 Booking Details</h4>
                        <p><strong>Room:</strong> ${invoiceData.roomNumber} (${invoiceData.roomType})</p>
                        <p><strong>Check-in:</strong> ${invoiceData.checkIn}</p>
                        <p><strong>Check-out:</strong> ${invoiceData.checkOut}</p>
                        <p><strong>Nights:</strong> ${invoiceData.nights}</p>
                    </div>

                    <div style="background: #0A1F44; color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="margin: 0; text-align: center;">💰 Payment Summary</h4>
                    </div>
                    
                    <table class="invoice-table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Amount (Rs.)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Room Charges (${invoiceData.nights} nights)</td>
                                <td>${invoiceData.subtotal?.toLocaleString()}</td>
                            </tr>
                            <tr class="total-row">
                                <td><strong>Total Amount</strong></td>
                                <td><strong>${invoiceData.subtotal?.toLocaleString()}</strong></td>
                            </tr>
                            <tr>
                                <td>Paid Amount</td>
                                <td class="paid">${invoiceData.paid?.toLocaleString()}</td>
                            </tr>
                            ${invoiceData.pending > 0 ? `
                            <tr>
                                <td>Pending Amount</td>
                                <td class="pending">${invoiceData.pending?.toLocaleString()}</td>
                            </tr>
                            ` : ''}
                        </tbody>
                    </table>

                    <div style="text-align: center; margin: 25px 0;">
                        <div class="status status-${invoiceData.paymentStatus}" style="font-size: 16px; padding: 10px 20px;">
                            Payment Status: ${invoiceData.paymentStatus?.toUpperCase()}
                        </div>
                    </div>

                    <p style="color: #666; font-size: 14px; text-align: center;">
                        If you have any questions about this invoice, please contact us.
                    </p>
                </div>
                
                <div class="footer">
                    <p style="margin: 0 0 10px 0;">
                        <strong>LuxuryStay Hotel & Resorts</strong><br>
                        📧 info@luxurystay.com | 📞 +92-300-0000000
                    </p>
                </div>
            </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ REAL email sent successfully to:', guestEmail);
    console.log('📫 Message ID:', result.messageId);
    return result;
    
  } catch (error) {
    console.error('❌ Error sending REAL email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send payment status update email
const sendPaymentStatusEmail = async (booking, oldStatus, newStatus) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.warn('⚠️ No email transporter available. Skipping payment status email.');
      return { messageId: 'mock-message-id' };
    }

    const guestEmail = booking.guest?.email || booking.guestDetails?.email;
    const guestName = booking.guest?.name || booking.guestDetails?.name;

    const mailOptions = {
      from: `"LuxuryStay Hotel" <${process.env.EMAIL_USER}>`,
      to: guestEmail,
      subject: `Payment Status Updated - Booking #${booking._id.toString().slice(-8)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0A1F44, #1a365d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>LUXURYSTAY</h1>
            <p>Payment Status Updated</p>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2>Dear ${guestName},</h2>
            <p>Your payment status has been updated from <strong>${oldStatus}</strong> to <strong>${newStatus}</strong>.</p>
            <p>Thank you for choosing LuxuryStay!</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Payment status email sent to:', guestEmail);
    return result;

  } catch (emailError) {
    console.error("❌ Error sending payment status email:", emailError);
    throw emailError;
  }
};

// Get payment statistics
export const getPaymentStats = async (req, res) => {
  try {
    const bookings = await Booking.find();
    
    const stats = bookings.reduce((acc, booking) => {
      const subtotal = booking.totalAmount || 0;
      const paid = booking.payment?.paidAmount || 0;
      const pending = Math.max(0, subtotal - paid);
      
      acc.totalRevenue += subtotal;
      acc.paidAmount += paid;
      acc.pendingAmount += pending;
      acc.totalBookings += 1;
      
      return acc;
    }, { totalRevenue: 0, paidAmount: 0, pendingAmount: 0, totalBookings: 0 });

    res.status(200).json({
      success: true,
      data: stats,
      message: "Payment statistics fetched successfully"
    });

  } catch (error) {
    console.error("❌ Error fetching payment stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment statistics",
      error: error.message
    });
  }
};

// Helper functions
const mapToBackendStatus = (status) => {
  const statusMap = {
    'pending': 'pending',
    'partial': 'partially-paid', 
    'paid': 'paid'
  };
  return statusMap[status] || status;
};

const mapToFrontendStatus = (status) => {
  const statusMap = {
    'pending': 'pending',
    'partially-paid': 'partial', 
    'paid': 'paid',
    'failed': 'pending',
    'refunded': 'paid'
  };
  return statusMap[status] || 'pending';
};