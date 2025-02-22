import Input from "../components/input";
import Image from "next/image";
import FiliterObj from "@/joint/filiterObj";

export default function ToolBar() {
  return (
    <section className="mobile-bar">
      <section className="dropdown-container">
        <div className="dropdown-header">
          <Image
            className="dropdown-icon"
            aria-hidden
            src="/assets/filterIcon.png"
            alt="Globe icon"
            width={35}
            height={35}
          />
          <p className="dropdown-text">Filter</p>
        </div>
        <section className="dropdown-menu">
          <p className="highlight">Clear All</p>
          <FiliterObj />
        </section>
      </section>
      <section className="dropdown-container">
        <div className="dropdown-header">
          <p className="dropdown-text">People: 300</p>
        </div>
        <section className="dropdown-menu">
          <p className="highlight">guests:</p>
          <Input
            type={"text"}
            value={"City"}
            id={"city"}
            width={160}
            height={45}
          />
        </section>
      </section>
      <section className="dropdown-container">
        <div className="dropdown-header">
          <p className="dropdown-text">Date: 10/03/2025</p>
        </div>
        <section className="dropdown-menu r">
          <p className="highlight">Change Dates</p>
          <Input
            type={"text"}
            value={"City"}
            id={"city"}
            width={160}
            height={45}
          />
        </section>
      </section>
      <section className="dropdown-container">
        <div className="dropdown-header">
          <Image
            className="dropdown-icon"
            aria-hidden
            src="/assets/sortIcon.png"
            alt="Globe icon"
            width={40}
            height={40}
          />
          <p className="dropdown-text">Sort</p>
        </div>
        <section className="dropdown-menu r">
          <p className="highlight">Clear All</p>
          <FiliterObj />
        </section>
      </section>
    </section>
  );
}
