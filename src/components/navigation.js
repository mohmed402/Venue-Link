import "../styles/components.css";

export default function Navigation({ selcted }) {
  return (
    <nav className="nav-bar hide">
      <ul>
        <a href="./">
          <li className={selcted == 0 ? "selected" : ""}>Home</li>
        </a>
        <a href="./services">
          <li className={selcted == 1 ? "selected c" : ""}>Services</li>
        </a>
        <a href="./venue">
          <li className={selcted == 2 ? "selected c" : ""}>Venue</li>
        </a>
        <a href="#">
          <li className={selcted == 3 ? "selected end" : ""}>Contact Us</li>
        </a>
      </ul>
    </nav>
  );
}
