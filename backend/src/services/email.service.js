const transporter = require('../config/email');
const env = require('../config/env');
const logger = require('../utils/logger');

/**
 * Helper to send email or log if not configured
 * @param {Object} options - { to, subject, html, text }
 */
const sendMail = async ({ to, subject, html, text }) => {
  const from = `"ZYVO Platform" <${env.EMAIL_USER || 'noreply@zyvo.app'}>`;

  if (!transporter) {
    logger.info(`[EMAIL-MOCK] To: ${to} | Subject: ${subject} | Text: ${text || 'HTML Content'}`);
    return { messageId: 'mock-email-id-' + Date.now() };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text,
    });
    logger.info(`Email sent successfully to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email to ${to}: ${error.message}`);
    throw error;
  }
};

/**
 * Send Welcome Email to a newly registered user
 */
const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: 'Inter', sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #6366f1; font-weight: 700; margin-bottom: 16px;">Welcome to ZYVO, ${user.name}! 🌌</h2>
      <p style="font-size: 16px; line-height: 1.6;">We're thrilled to help you unlock the perfect study environment. Discover quiet rooms, co-working lounges, and focus pods instantly.</p>
      <div style="margin: 24px 0;">
        <a href="${env.FRONTEND_URL}/spaces" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; display: inline-block;">Find Study Spaces</a>
      </div>
      <p style="font-size: 14px; color: #64748b;">If you have any questions, reply to this email. We're here to help!</p>
    </div>
  `;

  return sendMail({
    to: user.email,
    subject: 'Welcome to ZYVO! 🎉 Discover your perfect study hub',
    html,
    text: `Welcome to ZYVO, ${user.name}! Start exploring study spaces at: ${env.FRONTEND_URL}/spaces`,
  });
};

/**
 * Send Password Reset Email with recovery link
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const html = `
    <div style="font-family: 'Inter', sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #6366f1; font-weight: 700; margin-bottom: 16px;">Reset Your Password 🔑</h2>
      <p style="font-size: 16px; line-height: 1.6;">Hi ${user.name}, we received a request to reset your password. Click the button below to set a new password:</p>
      <div style="margin: 24px 0;">
        <a href="${resetUrl}" style="background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; display: inline-block;">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #ef4444;">This link will expire in 1 hour. If you didn't make this request, you can safely ignore this email.</p>
    </div>
  `;

  return sendMail({
    to: user.email,
    subject: 'Reset Your ZYVO Password',
    html,
    text: `Reset your ZYVO password using this link: ${resetUrl}`,
  });
};

/**
 * Send Booking Confirmation Email
 */
const sendBookingConfirmationEmail = async (user, booking) => {
  const html = `
    <div style="font-family: 'Inter', sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #10b981; font-weight: 700; margin-bottom: 16px;">Booking Confirmed! ✅</h2>
      <p style="font-size: 16px; line-height: 1.6;">Hi ${user.name}, your reservation has been successfully booked. Here are your booking details:</p>
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 14px; line-height: 1.6;">
        <div><strong>Booking ID:</strong> ${booking.id}</div>
        <div><strong>Study Hall:</strong> ${booking.studyHall?.name || 'Study Hall'}</div>
        <div><strong>Date:</strong> ${new Date(booking.date).toDateString()}</div>
        <div><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</div>
        <div><strong>Seat Code:</strong> ${booking.seat?.seatNumber || 'N/A'}</div>
        <div><strong>Total Paid:</strong> ₹${booking.totalAmount}</div>
      </div>
      <p style="font-size: 14px; color: #64748b;">Please scan your QR code at the entrance when you arrive. Happy studying!</p>
    </div>
  `;

  return sendMail({
    to: user.email,
    subject: 'Booking Confirmed! - ZYVO',
    html,
    text: `Your ZYVO booking at ${booking.studyHall?.name || 'Study Hall'} on ${new Date(booking.date).toDateString()} is confirmed!`,
  });
};

/**
 * Send Booking Cancellation Email
 */
const sendBookingCancellationEmail = async (user, booking) => {
  const html = `
    <div style="font-family: 'Inter', sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #ef4444; font-weight: 700; margin-bottom: 16px;">Booking Cancelled</h2>
      <p style="font-size: 16px; line-height: 1.6;">Hi ${user.name}, your booking has been cancelled successfully.</p>
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 14px; line-height: 1.6;">
        <div><strong>Booking ID:</strong> ${booking.id}</div>
        <div><strong>Study Hall:</strong> ${booking.studyHall?.name || 'Study Hall'}</div>
        <div><strong>Refund Amount:</strong> ₹${booking.refundAmount || 0}</div>
      </div>
      <p style="font-size: 14px; color: #64748b;">The refund has been credited back to your wallet. We hope to see you again soon!</p>
    </div>
  `;

  return sendMail({
    to: user.email,
    subject: 'Booking Cancelled - ZYVO',
    html,
    text: `Your ZYVO booking has been cancelled. Refund amount of ₹${booking.refundAmount || 0} has been processed.`,
  });
};

/**
 * Send Owner Approval Email (When Admin approves Owner's Study Hall listing)
 */
const sendOwnerApprovalEmail = async (owner, studyHall) => {
  const html = `
    <div style="font-family: 'Inter', sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #6366f1; font-weight: 700; margin-bottom: 16px;">Your Study Hall is Approved! 🚀</h2>
      <p style="font-size: 16px; line-height: 1.6;">Dear ${owner.name}, we are pleased to inform you that your study space has been approved and is now live on the platform:</p>
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 14px; line-height: 1.6;">
        <div><strong>Study Hall Name:</strong> ${studyHall.name}</div>
        <div><strong>Category:</strong> ${studyHall.category}</div>
        <div><strong>Price Per Hour:</strong> ₹${studyHall.pricePerHour}</div>
        <div><strong>Status:</strong> Active & Bookable</div>
      </div>
      <p style="font-size: 14px; color: #64748b;">You can track bookings and update listing details in the Owner Dashboard.</p>
    </div>
  `;

  return sendMail({
    to: owner.email,
    subject: `Listing Approved: "${studyHall.name}" is now live! - ZYVO`,
    html,
    text: `Congratulations Rajesh! Your study hall "${studyHall.name}" is approved and live.`,
  });
};

module.exports = {
  sendMail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail,
  sendOwnerApprovalEmail,
};
