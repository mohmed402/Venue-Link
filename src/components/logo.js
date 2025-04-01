import Image from "next/image";

export default function Logo({ background }) {
  return (
    <Image
      className="company-logo"
      aria-hidden
      src={`/assets/${background ? "vlLogo" : "noBackLogo"}.png`}
      alt="Globe icon"
      width={120}
      height={120}
      priority
    />
  );
}
