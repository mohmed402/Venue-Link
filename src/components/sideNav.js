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
      <a href="./">Home</a>
      <a href="./services">Services</a>
      <a href="./venue">Venue</a>
      <a href="./book">Contact Us</a>
      <a href="./underReview">Admin</a>
    </section>
  );
}
