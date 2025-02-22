import Image from "next/image";

export default function Logo() {
  return (
    <Image
      className="company-logo"
      aria-hidden
      src="/assets/noBackLogo.png"
      alt="Globe icon"
      width={120}
      height={120}
    />
  );
}
