import Image from "next/image";
import Link from "next/link";
const WEB_URL = process.env.NEXT_PUBLIC_DOMAIN_URL || "http://localhost:3000";
export default function AdminNav() {
  return (
    <aside>
      <h1>The Wellhall</h1>
      <hr></hr>

      <nav>
        <Link href="/admin" className="a-nav">
          Dashboard
        </Link>
        <Link href="/underReview" className="a-nav selected">
          Review
        </Link>
        <Link href="/admin/bookings" className="a-nav">
          Bookings
        </Link>
        <Link href="/admin/employee-booking" className="a-nav">
        Booking System
        </Link>
        <Link href="/admin/reviews" className="a-nav">
          reviews
        </Link>
        <Link href="/admin/employees" className="a-nav">
        Employees
        </Link>
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
