import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';

// In-memory user store (single user setup — swap for DB in production)
const users = new Map();

export function findOrCreateUser(profile, provider) {
  const providerId = `${provider}:${profile.id}`;

  // Check if user exists by provider ID
  for (const [id, user] of users) {
    if (user.providerId === providerId) return user;
  }

  // Create new user
  const user = {
    id: crypto.randomUUID(),
    providerId,
    provider,
    displayName: profile.displayName || profile.username || 'User',
    email: profile.emails?.[0]?.value || null,
    avatar: profile.photos?.[0]?.value || null,
    solanaWallet: null, // Set when user connects Phantom
    createdAt: new Date().toISOString(),
  };

  users.set(user.id, user);
  return user;
}

export function getUserById(id) {
  return users.get(id) || null;
}

export function updateUser(id, updates) {
  const user = users.get(id);
  if (!user) return null;
  Object.assign(user, updates);
  users.set(id, user);
  return user;
}

export function setupPassport(app) {
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => done(null, getUserById(id)));

  // Google OAuth
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id') {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    }, (accessToken, refreshToken, profile, done) => {
      const user = findOrCreateUser(profile, 'google');
      done(null, user);
    }));
  }

  // GitHub OAuth
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_ID !== 'your-github-client-id') {
    passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: '/api/auth/github/callback',
    }, (accessToken, refreshToken, profile, done) => {
      const user = findOrCreateUser(profile, 'github');
      done(null, user);
    }));
  }

  app.use(passport.initialize());
  app.use(passport.session());
}

// Middleware to require authentication
export function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Authentication required' });
}
