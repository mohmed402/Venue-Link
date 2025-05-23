import Image from "next/image";
const WEB_URL = process.env.NEXT_PUBLIC_DOMAIN_URL || "http://localhost:3000";
export default function AdminNav() {
  return (
    <aside>
      <h1>The Wellhall</h1>
      <hr></hr>

      <nav>
        <a href="#1" className="a-nav">
          Dashboard
        </a>
        <a href="#1" className="a-nav selected">
          Review
        </a>
        <a href="#1" className="a-nav">
          Bookings
        </a>
        <a href="#1" className="a-nav">
          Inbox
        </a>
      </nav>
      <div className="user-container">
        <a href={WEB_URL} className="a-nav as">
          Sign-out
        </a>
        <section className="profileSec">
          <Image
            src={"/assets/user.png"}
            alt={`profile Icon`}
            width={40}
            height={40}
            className="image"
          />

          <div>
            <h2>Muhammad Ben</h2>
            <p>Admin</p>
          </div>
        </section>
      </div>
    </aside>
  );
}
