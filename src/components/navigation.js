import "../styles/components.css";
import Image from "next/image";

export default function Navigation({ selcted }) {
  return (
    <div className="nav-container">
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
        <a href="./contact">
          <li className={selcted == 3 ? "selected end" : ""}>Contact Us</li>
        </a>
      </ul>
    </nav>
        <a className="admin-icon-container hide" href="./underReview">
            <Image
              className="profile-icon"
              aria-hidden
              src="/assets/user.png"
              alt="admin page"
              width={32}
              height={32}
                  />
        </a>
    </div>

  );
}
