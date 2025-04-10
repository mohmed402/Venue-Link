// import { supabase } from "../services/supabaseClient";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Button from "@/components/button";

import getToReview from "@/context/getToReview";

function InquirieInfo({ inquirId, isReview, setIsReview, setDataHolder }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState(data?.status || 0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getToReview("venueById", inquirId);
        if (response) {
          setLoading(true);
          setData(response);
          setDataHolder(response);
          setLoading(false);
        } else {
          console.error("No data received from getToReview");
        }
      } catch (err) {
        console.error("Error fetching data:", err.message);
      }
    }

    fetchData();
  }, [inquirId]);

  useEffect(() => {
    setStatus(data?.status || 0);
  }, [data]);

  async function handelSubmit() {
    setLoading(true);
    const response = await getToReview("updateStateById", inquirId, status);
    if (response) {
      // setData(null);
      // setDataHolder(null);
      setLoading(false);
      console.log("venue updated", response);
    } else {
      console.error("No data updated");
    }
  }

  if (inquirId == null)
    return (
      <section className="info emty">
        <h2>Select User</h2>
      </section>
    );

  if (loading)
    return (
      <section className="info">
        <div className="mover"></div>
      </section>
    );

  return (
    <section className="info">
      <section>
        <div>
          <h3>{data[0]?.venue_name}</h3>
          {/* <h4>{data[0].departure_date}</h4> */}
        </div>

        {/* <div>
          <h3>Jeddah</h3>
          <h4>{data[0].return_date}</h4>
        </div> */}
      </section>
      <hr></hr>
      <section className="infoDetails">
        <div>
          <h4>Country: {data[0]?.country}</h4>
          <h4>City: {data[0]?.city}</h4>
        </div>
        <div>
          <h4>price: {data[0]?.venue_price}</h4>
          <h4>Status: {data[0]?.status}</h4>
        </div>
        <div>
          <label>Status:</label>
          <select
            value={status}
            onChange={(e) => setStatus(Number(e.target.value))}
          >
            <option value={0}>On hold</option>
            <option value={1}>Reviewed</option>
            <option value={2}>Sent</option>
            <option value={3}>Agreed</option>
          </select>
          <Button
            classN={"save-btn"}
            title={"Review"}
            width={130}
            height={40}
            colour={"main"}
            action={setIsReview}
            actionState={isReview}
          />
          <Button
            classN={"save-btn"}
            title={"Submit"}
            width={130}
            height={40}
            click={() => handelSubmit()}
          />
        </div>
      </section>
    </section>
  );
}

export default InquirieInfo;
