"use client";

import Image from "next/image";
import Button from "../components/button";
// import Input from "../components/input";
import Navigation from "@/components/navigation";
import { useNavHandler } from "@/context/NavContext";

import "./page.css";
import VenueAdvert from "@/components/venueAdvert";
import SideNav from "@/components/sideNav";
import NavIcon from "@/components/navIcon";
import Footer from "@/components/footer";
import Logo from "@/components/logo";
import SearchSec from "@/components/searchSec";

export default function Home() {
  return (
    <>
      <SideNav />
      <header>
        <section className="header-bar">
          <Logo />
          <Navigation selcted={0} />
          <NavIcon />
        </section>
        <Image
          className="header-img"
          aria-hidden
          src="/assets/mainBackground-home.png"
          alt="venue background"
          width={1920}
          height={1080}
        />
        <div className="header-content">
          <h1>Let`s make your vision come true</h1>
          <Button
            title={"Book Now"}
            width={200}
            height={47}
            colour={"main"}
            hide={true}
          />
          <SearchSec />
        </div>
      </header>
      <main>
        <VenueAdvert>
          <section className="main-title">
            <h2>Venues</h2>
            <h3>Most Viewed</h3>
          </section>
        </VenueAdvert>
        <section className="catering-service">
          <div className="shadow">
            <div className="catering-content">
              <h1>
                Catering <span className="h-h1">Service</span>
              </h1>

              <p>
                Make your event unforgettable with our premium catering
                services! Whether you`re hosting a corporate meeting, wedding,
                or private gathering, our venues offer a variety of in-house
                catering options to suit your needs. From buffet-style dining to
                customized menus, our catering teams ensure a seamless
                experience with delicious cuisine, professional service, and
                flexible meal plans.
              </p>
              <p>
                Book a venue with catering today and treat your guests to an
                exceptional dining experience!
              </p>
              <Button
                title={"Book Now"}
                width={200}
                height={47}
                colour={"main"}
                hide={false}
              />
            </div>
          </div>
        </section>
        <section className="ad-sec">
          <section className="list-venue-ad">
            <div>
              <Image
                src="/assets/cityIcon.png"
                alt="venue background"
                width={200}
                height={200}
              />
            </div>
            <div>
              <h3>List your venue for free and get more bookings!</h3>
              <p>
                We are the fastest-growing online marketplace for venue hire,
                connecting you directly with your ideal customers.
              </p>
              <Button
                title={"List your venue"}
                width={"80%"}
                height={"fit-content"}
                colour={"main"}
                margin={"10px auto"}
                page={"join"}
              />
            </div>
          </section>
          <section className="list-venue-frame">
            <Image
              className="manIcon"
              aria-hidden
              src="/assets/manHandsUpIcon.png"
              alt="venue background"
              width={200}
              height={98}
            />
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}
