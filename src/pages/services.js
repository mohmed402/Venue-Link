import Image from "next/image";
import Button from "../components/button";

import { useNavHandler } from "@/context/NavContext";
import "../styles/services.css";
import Input from "../components/input";

import Navigation from "@/components/navigation";
import Venue from "@/components/venue";
import SideNav from "@/components/sideNav";
import NavIcon from "@/components/navIcon";
import Footer from "@/components/footer";
import Checkbox from "@/components/checkBox";
import FiliterObj from "@/joint/filiterObj";
import ToolBar from "@/components/toolBar";
export default function Services() {
  return (
    <>
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
          {/* <NavIcon /> */}
        </section>
        <Image
          className="header-img"
          aria-hidden
          src="/assets/venue-list.png"
          alt="venue background"
          width={1920}
          height={680}
        />
        <h1>Halls</h1>
      </header>
      <main>
        <section className="modifcation-bar">
          {/* <label for="people">Choose a car:</label> */}
          <select name="people" placeholder="People">
            <option>People</option>
            <option>100</option>
            <option>200</option>
            <option>300</option>
            <option>500</option>
            <option>1000</option>
          </select>
          <input type="date" name="date" className="date" />
          <input type="number" name="price" placeholder="price" />
          <Button
            title={"Search"}
            width={"13%"}
            height={40}
            colour={"main"}
            hide={false}
          />
          <a className="favorite-list" href="#">
            Favorite List
          </a>
        </section>
        <ToolBar />
        <section className="main-header">
          <h1>Venues in Manchester</h1>
          <div className="search-info">
            <p className="found-text"> Shown 267 venues in this area</p>

            {/* <i class="uit uit-sort-amount-down"></i> */}
            <select className="sort" name="sort">
              <option>Sort by</option>
              <option>Best</option>
              <option>Cheapest</option>
              <option>Most Reviewd</option>
              <option>Recommended</option>
            </select>
          </div>
        </section>
        <hr className="hr-line-one"></hr>
        <section className="main-main-contanior">
          <aside className="filter">
            <div className="filter-header">
              <h4>Filter</h4>
              <p className="highlight">Clear All</p>
            </div>
            <FiliterObj />
          </aside>
          <div className="vl"></div>
          <Venue />
        </section>
      </main>
      {/* <Footer /> */}
    </>
  );
}
