"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Button from "../components/button";
import Input from "@/components/input";

export default function SearchSec() {
  const [city, setCity] = useState("City");
  const [purpose, setPurpose] = useState("Purpose");
  const [date, setDate] = useState();
  const router = useRouter();

  function inputCheck() {
    if (city == "City" || city == "") {
      setCity("Enter City first");
      return;
    }
    if (date == undefined) {
      setDate("");
      return;
    }
    router.push("/services");
  }

  return (
    <section className="search-bar">
      <Input
        classN={city == "Enter City first" && "input-error"}
        type={"text"}
        value={city}
        id={"city"}
        onChange={(value) => setCity(value)}
        width={160}
        height={45}
      />
      <Input
        type={"text"}
        value={purpose}
        inChange={(value) => setPurpose(value)}
        id={"Purpose"}
        width={160}
        height={45}
      />
      <Input
        classN={date == "" && "input-error"}
        type={"date"}
        value={date}
        inChange={(value) => setDate(value)}
        id={"date"}
        width={160}
        height={45}
      />
      <Button
        title={"Search"}
        width={160}
        height={45}
        colour={"main"}
        click={inputCheck}
      />
    </section>
  );
}
