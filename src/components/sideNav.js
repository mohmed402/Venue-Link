"use client";
import { useNavHandler } from "@/context/NavContext";

import "../styles/components.css";

export default function SideNav() {
  const { navOpen, toggleNav } = useNavHandler();

  return (
    <section className="sidenav" style={{ width: navOpen ? "250px" : "0" }}>
      <a href="#" className="closebtn" onClick={toggleNav}>
        &times;
      </a>
      <a href="./services">Services</a>
      <a href="./Venue">Venue</a>
      <a href="#">Clients</a>
      <a href="#">Contact</a>
    </section>
  );
}
