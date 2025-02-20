import "../styles/components.css";

export default function Navigation() {
  return (
    <nav className="nav-bar hide">
      <ul>
        <li className="selected">
          <a href="./">Home</a>
        </li>
        <li>
          <a href="./services">Services</a>
        </li>
        <li>
          <a href="./Venue">Venue</a>
        </li>
        <li>Contact Us</li>
      </ul>
    </nav>
  );
}
