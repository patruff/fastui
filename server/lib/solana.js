import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  getAccount,
} from '@solana/spl-token';
import bs58 from 'bs58';

// In-memory credits store (single user — swap for on-chain reads in production)
const creditsStore = new Map();

const FREE_CREDITS = 10;
const CREDITS_PER_PACK = 10;
const PRICE_PER_PACK_USDC = 2; // 2 USDC
const USDC_DECIMALS = 6;

let connection;
let ownerKeypair;
let usdcMint;
let ownerWallet;

export function initSolana() {
  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  connection = new Connection(rpcUrl, 'confirmed');

  usdcMint = new PublicKey(
    process.env.USDC_MINT || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
  );

  ownerWallet = new PublicKey(process.env.SOLANA_OWNER_WALLET);

  // Owner keypair for signing use_credit transactions on-chain
  if (process.env.SOLANA_OWNER_PRIVATE_KEY) {
    try {
      const decoded = bs58.decode(process.env.SOLANA_OWNER_PRIVATE_KEY);
      ownerKeypair = Keypair.fromSecretKey(decoded);
    } catch {
      console.warn('Warning: Invalid SOLANA_OWNER_PRIVATE_KEY, on-chain credit deduction disabled');
    }
  }

  console.log(`Solana connected to ${rpcUrl}`);
  console.log(`Owner wallet: ${ownerWallet.toBase58()}`);
  console.log(`USDC mint: ${usdcMint.toBase58()}`);
}

// Get or create user credits entry
export function getUserCredits(userId) {
  if (!creditsStore.has(userId)) {
    creditsStore.set(userId, {
      remaining: FREE_CREDITS,
      totalPurchased: 0,
      totalUsed: 0,
    });
  }
  return creditsStore.get(userId);
}

// Use one credit
export function useCredit(userId) {
  const credits = getUserCredits(userId);
  if (credits.remaining <= 0) {
    return { success: false, error: 'No credits remaining' };
  }
  credits.remaining--;
  credits.totalUsed++;
  return { success: true, remaining: credits.remaining };
}

// Check if user has credits
export function hasCredits(userId) {
  return getUserCredits(userId).remaining > 0;
}

// Build a USDC transfer transaction for the user to sign with Phantom.
// Returns the serialized transaction for client-side signing.
export async function buildPurchaseTransaction(userWalletAddress) {
  const userWallet = new PublicKey(userWalletAddress);

  const userTokenAccount = await getAssociatedTokenAddress(usdcMint, userWallet);
  const ownerTokenAccount = await getAssociatedTokenAddress(usdcMint, ownerWallet);

  const amount = PRICE_PER_PACK_USDC * Math.pow(10, USDC_DECIMALS); // 2 USDC in lamports

  const transferIx = createTransferInstruction(
    userTokenAccount,
    ownerTokenAccount,
    userWallet,
    amount
  );

  const transaction = new Transaction().add(transferIx);

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = userWallet;

  const serialized = transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  });

  return {
    transaction: Buffer.from(serialized).toString('base64'),
    amount: PRICE_PER_PACK_USDC,
    credits: CREDITS_PER_PACK,
  };
}

// Verify a signed transaction was confirmed on-chain and add credits
export async function verifyAndAddCredits(userId, signature) {
  try {
    // Wait for confirmation
    const result = await connection.confirmTransaction(signature, 'confirmed');

    if (result.value.err) {
      return { success: false, error: 'Transaction failed on-chain' };
    }

    // Verify the transaction details
    const tx = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      return { success: false, error: 'Transaction not found' };
    }

    // Add credits to user
    const credits = getUserCredits(userId);
    credits.remaining += CREDITS_PER_PACK;
    credits.totalPurchased += CREDITS_PER_PACK;

    return {
      success: true,
      remaining: credits.remaining,
      purchased: CREDITS_PER_PACK,
    };
  } catch (err) {
    console.error('Error verifying transaction:', err);
    return { success: false, error: err.message };
  }
}

export function getPaymentInfo() {
  return {
    pricePerPack: PRICE_PER_PACK_USDC,
    creditsPerPack: CREDITS_PER_PACK,
    freeCredits: FREE_CREDITS,
    usdcMint: usdcMint?.toBase58(),
    ownerWallet: ownerWallet?.toBase58(),
    network: process.env.SOLANA_RPC_URL?.includes('devnet') ? 'devnet' : 'mainnet-beta',
  };
}
