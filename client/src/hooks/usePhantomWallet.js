import { useState, useCallback, useEffect } from 'react';

export function usePhantomWallet() {
  const [wallet, setWallet] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [isPhantomInstalled, setIsPhantomInstalled] = useState(false);

  useEffect(() => {
    const checkPhantom = () => {
      const provider = window.solana;
      if (provider?.isPhantom) {
        setIsPhantomInstalled(true);
        setWallet(provider);

        // Auto-reconnect if previously connected
        if (provider.isConnected && provider.publicKey) {
          setPublicKey(provider.publicKey.toBase58());
        }

        provider.on('connect', (pk) => setPublicKey(pk.toBase58()));
        provider.on('disconnect', () => setPublicKey(null));
        provider.on('accountChanged', (pk) => {
          setPublicKey(pk ? pk.toBase58() : null);
        });
      }
    };

    // Phantom injects after page load on mobile
    if (document.readyState === 'complete') {
      checkPhantom();
    } else {
      window.addEventListener('load', checkPhantom);
      return () => window.removeEventListener('load', checkPhantom);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!wallet) {
      // On mobile, open Phantom deep link
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `https://phantom.app/ul/browse/${currentUrl}`;
      return null;
    }

    try {
      const resp = await wallet.connect();
      const pk = resp.publicKey.toBase58();
      setPublicKey(pk);

      // Link wallet to server account
      await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ walletAddress: pk }),
      });

      return pk;
    } catch (err) {
      console.error('Phantom connect error:', err);
      return null;
    }
  }, [wallet]);

  const disconnect = useCallback(async () => {
    if (wallet) {
      await wallet.disconnect();
      setPublicKey(null);
    }
  }, [wallet]);

  const signAndSendTransaction = useCallback(async (serializedTx) => {
    if (!wallet) throw new Error('Phantom not connected');

    const txBytes = Uint8Array.from(atob(serializedTx), c => c.charCodeAt(0));

    // Phantom expects a Transaction object — we reconstruct from bytes
    const { Transaction } = await import('@solana/web3.js');
    const transaction = Transaction.from(txBytes);

    const signed = await wallet.signTransaction(transaction);
    const { Connection } = await import('@solana/web3.js');

    // Use the same RPC as the server
    const infoRes = await fetch('/api/credits/payment-info');
    const info = await infoRes.json();
    const rpcUrl = info.network === 'devnet'
      ? 'https://api.devnet.solana.com'
      : 'https://api.mainnet-beta.solana.com';

    const connection = new Connection(rpcUrl, 'confirmed');
    const signature = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(signature, 'confirmed');

    return signature;
  }, [wallet]);

  return {
    isPhantomInstalled,
    publicKey,
    connect,
    disconnect,
    signAndSendTransaction,
  };
}
