import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Header() {
  return (
    <header className="fixed top-0 z-10 flex h-18 w-full border bg-white shadow-sm">
      <nav className="flex h-full w-full items-center justify-between gap-4 px-8 sm:px-16">
        <span className="relative flex h-5 flex-shrink">
          <img src="/next.svg" alt="NextJS" />
        </span>

        <WalletMultiButton />
      </nav>
    </header>
  );
}
