import crypto from 'crypto';

export function hashEmail(email) {
  if (!email) return null;

  // Normalize: lowercase and trim
  const normalized = email.toLowerCase().trim();

  // SHA-256 hash
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

export function hashPhone(phone) {
  if (!phone) return null;

  // Remove all non-digits
  const normalized = phone.replace(/\D/g, '');

  return crypto.createHash('sha256').update(normalized).digest('hex');
}
