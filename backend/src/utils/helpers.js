const { v4: uuidv4 } = require('uuid');

/**
 * Generate a unique referral code based on name and random suffix
 * @param {string} name
 */
const generateReferralCode = (name = 'USER') => {
  const prefix = name.replace(/\s+/g, '').toUpperCase().slice(0, 4);
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${suffix}`;
};

/**
 * Generate a QR code string for a booking
 * @param {string} bookingId
 */
const generateBookingQR = (bookingId) => {
  return `ZYVO-${bookingId}-${Date.now()}`;
};

/**
 * Calculate the total price for a booking
 * @param {number} pricePerHour
 * @param {number} durationHours
 * @param {number} discountAmount
 * @param {number} taxRate - default 18% GST
 */
const calculateBookingPrice = (pricePerHour, durationHours, discountAmount = 0, taxRate = 0.18) => {
  const baseAmount = parseFloat((pricePerHour * durationHours).toFixed(2));
  const discounted = parseFloat((baseAmount - discountAmount).toFixed(2));
  const taxAmount = parseFloat((discounted * taxRate).toFixed(2));
  const totalAmount = parseFloat((discounted + taxAmount).toFixed(2));
  return { baseAmount, discountAmount, taxAmount, totalAmount };
};

/**
 * Apply coupon discount to a booking
 * @param {Object} coupon - Coupon from DB
 * @param {number} baseAmount
 */
const applyCouponDiscount = (coupon, baseAmount) => {
  if (!coupon) return 0;
  if (coupon.minOrderAmount && baseAmount < coupon.minOrderAmount) return 0;

  let discount = 0;
  if (coupon.discountType === 'PERCENT') {
    discount = (baseAmount * coupon.discountValue) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else if (coupon.discountType === 'FLAT') {
    discount = coupon.discountValue;
  }
  return parseFloat(Math.min(discount, baseAmount).toFixed(2));
};

/**
 * Calculate duration in hours between two time strings (HH:MM)
 * @param {string} startTime - "09:00"
 * @param {string} endTime - "12:00"
 */
const calculateDurationHours = (startTime, endTime) => {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  return parseFloat(((endMinutes - startMinutes) / 60).toFixed(2));
};

/**
 * Check if a time slot overlaps with existing bookings
 * @param {string} start1 - "09:00"
 * @param {string} end1 - "12:00"
 * @param {string} start2
 * @param {string} end2
 */
const doTimeSlotsOverlap = (start1, end1, start2, end2) => {
  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const s1 = toMinutes(start1), e1 = toMinutes(end1);
  const s2 = toMinutes(start2), e2 = toMinutes(end2);
  return s1 < e2 && s2 < e1;
};

/**
 * Get pagination parameters from request query
 * @param {Object} query - req.query
 */
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Format a date to YYYY-MM-DD string
 * @param {Date} date
 */
const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

/**
 * Sanitize user object (remove sensitive fields)
 * @param {Object} user
 */
const sanitizeUser = (user) => {
  const { passwordHash, firebaseUid, ...safe } = user;
  return safe;
};

/**
 * Parse boolean from string query param
 * @param {string} value
 */
const parseBoolean = (value) => {
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return undefined;
};

module.exports = {
  generateReferralCode,
  generateBookingQR,
  calculateBookingPrice,
  applyCouponDiscount,
  calculateDurationHours,
  doTimeSlotsOverlap,
  getPagination,
  formatDate,
  sanitizeUser,
  parseBoolean,
};
