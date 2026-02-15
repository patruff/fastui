import { Router } from 'express';
import passport from 'passport';
import { updateUser } from '../lib/auth.js';

const router = Router();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${CLIENT_URL}/login?error=google` }),
  (req, res) => res.redirect(CLIENT_URL)
);

// GitHub OAuth
router.get('/github', passport.authenticate('github', {
  scope: ['user:email'],
}));

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: `${CLIENT_URL}/login?error=github` }),
  (req, res) => res.redirect(CLIENT_URL)
);

// Get current user
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.json({ user: null });
  }
  res.json({ user: req.user });
});

// Link Solana wallet
router.post('/wallet', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { walletAddress } = req.body;
  if (!walletAddress) {
    return res.status(400).json({ error: 'walletAddress required' });
  }

  const user = updateUser(req.user.id, { solanaWallet: walletAddress });
  res.json({ user });
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ ok: true });
  });
});

export default router;
