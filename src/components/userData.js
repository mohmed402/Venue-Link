import React, { useEffect, useState } from "react";
import Image from "next/image";
import getToReview from "@/context/getToReview";

function UserData({ getId, setInquirId }) {
  const [data, setData] = useState([]);
  const [id, setId] = useState(null);

  function assignId(value) {
    if (id === value) {
      setId(null);
      setInquirId(null);
    } else {
      setId(value);
      getId(value);
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getToReview("venues");
        if (response) {
          setData(response);
        } else {
          console.error("No data received from getToReview");
        }
      } catch (err) {
        console.error("Error fetching data:", err.message);
      }
    }

    fetchData();
  }, []);

  return (
    <section className="table-container">
      <table>
        <thead>
          <tr>
            <th>Number</th>
            <th>Action</th>
            <th>Name</th>
            <th>Country</th>
            <th>Status</th>
            <th>Received</th>
            <th>Info</th>
          </tr>
        </thead>
        <tbody>
          {data.map((dataItem, index) => (
            <Row
              key={dataItem.venue_id}
              id={dataItem.venue_id}
              num={index}
              name={dataItem.venue_name}
              email={dataItem.country}
              date={formatDate(dataItem.created_at)}
              status={dataItem.status}
              assignId={assignId}
              isClicked={id === dataItem.req_id}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default UserData;

function Row({ id, status, num, name, email, date, assignId, isClicked }) {
  const stateType = statusCase(status);

  return (
    <tr className={isClicked ? "select" : ""}>
      <td>{num}</td>
      <td>
        <Image
          src="/assets/bin.png"
          alt="delete Icon"
          width={30}
          height={30}
          className="image"
        />
        <Image
          src="/assets/email.png"
          alt="email Icon"
          width={30}
          height={30}
          className="image"
        />
      </td>
      <td>{name}</td>
      <td>{email}</td>
      <td>
        <Status state={stateType.type} classN={stateType.class} />
      </td>
      <td>{date}</td>
      <td>
        <Image
          src="/assets/info.png"
          alt="information Icon"
          width={30}
          height={30}
          className="icon"
          onClick={() => assignId(id)}
        />
      </td>
    </tr>
  );
}

function Status({ state, classN }) {
  return <p className={`status ${classN}`}>{state}</p>;
}

function statusCase(status) {
  switch (status) {
    case 0:
      return { type: "H", class: "holder" };
    case 1:
      return { type: "R", class: "reviewed" };
    case 2:
      return { type: "S", class: "sent" };
    case 3:
      return { type: "A", class: "agreed" };
    default:
      return { type: "H", class: "holder" };
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return `${date.toLocaleDateString()} - ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}
