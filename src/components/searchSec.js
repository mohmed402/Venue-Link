// "use client";
import Button from "../components/button";
import Input from "@/components/input";

export default function SearchSec() {
  return (
    <section className="search-bar">
      <Input type={"text"} value={"City"} id={"city"} width={160} height={45} />
      <Input
        type={"text"}
        value={"Purpose"}
        id={"Purpose"}
        width={160}
        height={45}
      />
      <Input type={"date"} value={"Date"} id={"date"} width={160} height={45} />
      <Button
        title={"Search"}
        width={160}
        height={45}
        colour={"main"}
        page={"services"}
      />
    </section>
  );
}
