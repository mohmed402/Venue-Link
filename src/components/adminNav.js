import Image from "next/image";
import Link from "next/link";
import "../styles/adminNav.css";
import { usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { checkPermission } from "../utils/roles";

const WEB_URL = process.env.NEXT_PUBLIC_DOMAIN_URL || "http://localhost:3000";
export default function AdminNav() {
  const pathname = usePathname();
  const { user, logout, userRole } = useAuth();
  const { t, isRTL } = useLanguage();

  const handleSignOut = (e) => {
    e.preventDefault();
    logout();
  };

  return (
    <aside className={isRTL ? 'rtl' : ''}>
      <div className="logo-container">
        <Image
          src="/assets/venue-link-logo.png"
          alt="Venue Link Management"
          width={200}
          height={80}
          className="logo"
          priority
        />
      </div>
      <hr></hr>

      <nav>
        {checkPermission(userRole, 'canViewDashboard') && (
          <Link href="/admin" className={`a-nav ${pathname === "/admin" ? "selected" : ""}`}>
            {t('nav.dashboard')}
          </Link>
        )}
        {checkPermission(userRole, 'canAccessReview') && (
          <Link href="/underReview" className={`a-nav ${pathname === "/underReview" ? "selected" : ""}`}>
            {t('nav.review')}
          </Link>
        )}
        {checkPermission(userRole, 'canManageBookings') && (
          <Link href="/admin/bookings" className={`a-nav ${pathname === "/admin/bookings" ? "selected" : ""}`}>
            {t('nav.bookings')}
          </Link>
        )}
        {checkPermission(userRole, 'canManageBookings') && (
          <Link href="/admin/employee-booking" className={`a-nav ${pathname === "/admin/employee-booking" ? "selected" : ""}`}>
            {t('booking.title')}
          </Link>
        )}
        {checkPermission(userRole, 'canAccessReview') && (
          <Link href="/admin/reviews" className={`a-nav ${pathname === "/admin/reviews" ? "selected" : ""}`}>
            {t('nav.reviews')}
          </Link>
        )}
        {checkPermission(userRole, 'canManageEmployees') && (
          <Link href="/admin/employees" className={`a-nav ${pathname === "/admin/employees" ? "selected" : ""}`}>
            Staff Management
          </Link>
        )}
        {checkPermission(userRole, 'canEditVenue') && (
          <Link href="/admin/settings" className={`a-nav ${pathname === "/admin/settings" ? "selected" : ""}`}>
            {t('nav.settings')}
          </Link>
        )}
      </nav>
      <div className="user-container">
        <a href="#" onClick={handleSignOut} className="a-nav as">
          {t('nav.signout')}
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
            <h2>{user?.name || user?.email || user?.phone || 'User'}</h2>
            <p className={`role-badge ${user?.role}`}>
              {user?.role === 'admin' ? 'Administrator' : 
               user?.role === 'manager' ? 'Manager' :
               user?.role === 'employee' ? 'Employee' :
               user?.role === 'staff' ? 'Staff Member' : 'User'}
            </p>
          </div>
        </section>
      </div>
    </aside>
  );
}
