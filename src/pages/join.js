import Image from "next/image";
import Button from "../components/button";

import { useNavHandler } from "@/context/NavContext";
import "@/styles/services.css";
import "@/styles/join.css";

import Navigation from "@/components/navigation";
import TypingEffect from "@/components/TypingEffect";
import SideNav from "@/components/sideNav";
import NavIcon from "@/components/navIcon";
import Footer from "@/components/footer";

import Logo from "@/components/logo";
function join() {
  return (
    <>
      <header className="join-header">
        <section className="header-bar">
          <Logo />
          <Navigation selcted={1} />
          {/* <NavIcon /> */}
        </section>
        <div className="overlay">
          <section className="header-title">
            <h1>List Anything</h1>
            <TypingEffect
              words={[
                "Meeting rooms",
                "Venues",
                "Catering Services",
                "Hotel Halls",
              ]}
              speed={100}
              eraseSpeed={50}
              delay={1500}
            />

            <h1>on Venue Link</h1>
            <p>list with us today and quickly start earning more income.</p>
            <Button
              title={`Get started now`}
              width={300}
              height={80}
              colour={"main"}
              classN={"join-btn"}
              page={"joinform"}
              hide={false}
            />
          </section>
        </div>
        <Image
          className="header-img-join"
          aria-hidden
          src="/assets/venueJoin.png"
          alt="venue background"
          width={1920}
          height={980}
          priority
        />
      </header>
      <main className="join-main">
        <h1 className="main-join-title">List with confidence and ease</h1>
        <section className="benifits-list">
          <div>
            <h3>Choose how you prefer to receive bookings</h3>
            <Image
              aria-hidden
              src="/assets/icon-join-1.png"
              alt="venue background"
              width={250}
              height={200}
              priority
            />
            <p>
              Either by letting guests book instantly or by reviewing booking
              requests before accepting them.
            </p>
          </div>
          <div>
            <h3>Get paid and secure your finances</h3>
            <Image
              aria-hidden
              src="/assets/icon-join-2.png"
              alt="venue background"
              width={280}
              height={180}
              priority
            />
            <p>
              Get guaranteed payouts and fraud protection through Payments by
              venuelink.com.
            </p>
          </div>
          <div>
            <h3>Your own house rules</h3>
            <Image
              aria-hidden
              src="/assets/icon-join-3.png"
              alt="venue background"
              width={250}
              height={200}
              priority
            />
            <p>
              Communicate your house rules to potential guests who must agree to
              them in order to book.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default join;
