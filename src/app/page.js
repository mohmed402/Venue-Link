// "use client";
import Image from "next/image";
import Button from "../components/button";
import Input from "../components/input";
import Navigation from "@/components/navigation";
import { useNavHandler } from "@/context/NavContext";

import "./page.css";
import venueAdvert from "@/components/venueAdvert";
import SideNav from "@/components/sideNav";
import NavIcon from "@/components/navIcon";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <>
      <SideNav />
      <header>
        <section className="header-bar">
          <Image
            className="company-logo"
            aria-hidden
            src="/assets/noBackLogo.png"
            alt="Globe icon"
            width={120}
            height={120}
          />
          <Navigation />
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
          <section className="search-bar">
            <Input
              type={"text"}
              value={"City"}
              id={"city"}
              width={160}
              height={45}
            />
            <Input
              type={"text"}
              value={"Purpose"}
              id={"Purpose"}
              width={160}
              height={45}
            />
            <Input
              type={"date"}
              value={"Date"}
              id={"date"}
              width={160}
              height={45}
            />
            <Button title={"Search"} width={160} height={45} colour={"main"} />
          </section>
        </div>
      </header>
      <main>
        <venueAdvert>
          <section className="main-title">
            <h2>Venues</h2>
            <h3>Most Viewed</h3>
          </section>
        </venueAdvert>
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
                className=""
                aria-hidden
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
            {/* <Image
              className=""
              aria-hidden
              src="/assets/list-venue-frame.png"
              alt="venue background"
              width={2200}
              height={200}
            /> */}
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}
