import { Router } from 'express';
import { requireAuth } from '../lib/auth.js';
import {
  getUserCredits,
  buildPurchaseTransaction,
  verifyAndAddCredits,
  getPaymentInfo,
} from '../lib/solana.js';

const router = Router();

// Get user's credit balance
router.get('/', requireAuth, (req, res) => {
  const credits = getUserCredits(req.user.id);
  res.json(credits);
});

// Get payment info (price, network, etc.)
router.get('/payment-info', (req, res) => {
  res.json(getPaymentInfo());
});

// Build a purchase transaction for the user to sign
router.post('/purchase', requireAuth, async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(400).json({ error: 'walletAddress required' });
    }

    const result = await buildPurchaseTransaction(walletAddress);
    res.json(result);
  } catch (err) {
    console.error('Error building purchase tx:', err);
    res.status(500).json({ error: err.message });
  }
});

// Verify a signed transaction and add credits
router.post('/verify', requireAuth, async (req, res) => {
  try {
    const { signature } = req.body;
    if (!signature) {
      return res.status(400).json({ error: 'signature required' });
    }

    const result = await verifyAndAddCredits(req.user.id, signature);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error('Error verifying purchase:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
