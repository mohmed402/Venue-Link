"use client";

import { useNavHandler } from "@/context/NavContext";

export default function NavIcon() {
  const { toggleNav } = useNavHandler();

  return (
    <span className="side-nav-icon" onClick={toggleNav}>
      &#9776;
    </span>
  );
}
