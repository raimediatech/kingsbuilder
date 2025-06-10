// api/utils/session.js - Session management utilities
const crypto = require('crypto');

// In-memory session store (for development)
// In production, use Redis or another persistent store
const sessions = {};

// Generate a random session ID
function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

// Create a new session
function createSession(shop, accessToken) {
  const sessionId = generateSessionId();
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  
  sessions[sessionId] = {
    shop,
    accessToken,
    createdAt: Date.now(),
    expiresAt
  };
  
  return sessionId;
}

// Get session data
function getSession(sessionId) {
  const session = sessions[sessionId];
  
  if (!session) {
    return null;
  }
  
  // Check if session has expired
  if (session.expiresAt < Date.now()) {
    delete sessions[sessionId];
    return null;
  }
  
  return session;
}

// Get access token for a shop
function getAccessToken(shop) {
  // Find the first valid session for this shop
  for (const sessionId in sessions) {
    const session = sessions[sessionId];
    
    if (session.shop === shop && session.expiresAt > Date.now()) {
      return session.accessToken;
    }
  }
  
  return null;
}

// Store access token for a shop
function storeAccessToken(shop, accessToken) {
  // Remove any existing sessions for this shop
  for (const sessionId in sessions) {
    const session = sessions[sessionId];
    
    if (session.shop === shop) {
      delete sessions[sessionId];
    }
  }
  
  // Create a new session
  return createSession(shop, accessToken);
}

// Clean up expired sessions
function cleanupSessions() {
  const now = Date.now();
  
  for (const sessionId in sessions) {
    const session = sessions[sessionId];
    
    if (session.expiresAt < now) {
      delete sessions[sessionId];
    }
  }
}

// Run cleanup every hour
setInterval(cleanupSessions, 60 * 60 * 1000);

module.exports = {
  createSession,
  getSession,
  getAccessToken,
  storeAccessToken
};