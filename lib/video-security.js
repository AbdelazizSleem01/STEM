import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export function generatePlaybackToken(userId, courseId, videoId) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET must be defined');
  }

  return jwt.sign(
    {
      userId,
      courseId,
      videoId,
      exp: Math.floor(Date.now() / 1000) + (5 * 60), // 5 minutes
    },
    JWT_SECRET
  );
}

export function verifyPlaybackToken(token) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET must be defined');
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired playback token');
  }
}

export function generateWatermark(user) {
  // This function will return watermark text to be overlaid on videos
  return `${user.email} - ${new Date().toISOString().split('T')[0]}`;
}

export function checkDeviceFingerprint(req, user) {
  const currentFingerprint = {
    userAgent: req.headers['user-agent'],
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
  };

  // Check if this device fingerprint exists in user's active sessions
  const existingSession = user.activeSessions.find(
    session => 
      session.deviceFingerprint === currentFingerprint.userAgent &&
      session.ip === currentFingerprint.ip
  );

  if (!existingSession) {
    // This is a new device/location
    return {
      isKnownDevice: false,
      fingerprint: currentFingerprint,
    };
  }

  return {
    isKnownDevice: true,
    fingerprint: currentFingerprint,
  };
}
