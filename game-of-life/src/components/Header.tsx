"use client";

import { useTransactionStateStore } from "@/app/_store/gameOfLifeStore";
import { SigninMessage } from "@/utils/signature";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { useSession, getCsrfToken, signIn, signOut } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function Header() {
  const { inProgress, setInProgress } = useTransactionStateStore();
  const { data: session, status } = useSession();
  const { connected, publicKey, signMessage, disconnect, wallet } = useWallet();
  const [currentPublicKey, setCurrentPublicKey] = useState<PublicKey | null>(
    null,
  );
  const { setVisible } = useWalletModal();

  const handleSignOut = useCallback(async () => {
    await disconnect();

    await signOut({ redirect: false });
  }, [disconnect]);

  const handleSignIn = useCallback(async () => {
    setInProgress(true);

    try {
      if (!connected) {
        setInProgress(false);

        return;
      }

      const csrf = await getCsrfToken();

      if (!csrf || !signMessage) {
        setInProgress(false);

        return;
      }

      const message = new SigninMessage({
        domain: window.location.host,
        address: publicKey?.toBase58() ?? "",
        statement: "Sign this message to sign in to the app.",
        nonce: csrf,
      });

      const data = new TextEncoder().encode(message.prepare());

      const signature = await signMessage(data);
      const serializedSignature = bs58.encode(signature);

      signIn("credentials", {
        message: JSON.stringify(message),
        signature: serializedSignature,
        redirect: false,
      });
    } catch (error) {
      console.error(error);
      toast.error("An error occured while signing in with your wallet");

      await handleSignOut();
    }

    setInProgress(false);
  }, [connected, handleSignOut, publicKey, setInProgress, signMessage]);

  useEffect(() => {
    if (connected && !session) {
      handleSignIn();
    }
  }, [connected, handleSignIn, publicKey, session]);

  // useEffect(() => {
  //   if (currentPublicKey && publicKey && !currentPublicKey.equals(publicKey)) {
  //     handleSignOut();
  //   }
  // }, [currentPublicKey, handleSignOut, publicKey]);

  return (
    <header className="fixed top-0 z-10 flex h-18 w-full border bg-white shadow-sm">
      <nav className="flex h-full w-full items-center justify-between gap-4 px-8 sm:px-16">
        <span className="relative flex h-5 flex-shrink">
          <img src="/next.svg" alt="NextJS" />
        </span>

        <button
          type="button"
          className="btn btn-md btn-black"
          disabled={inProgress}
          onClick={async () => {
            if (status === "authenticated") {
              await handleSignOut();
            } else {
              setVisible(true);
            }
          }}
        >
          {session ? "Sign out" : "Sign in"}
        </button>
      </nav>
    </header>
  );
}
