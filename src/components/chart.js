import getToReview from "@/context/getToReview";
import React, { useEffect, useState } from "react";
// import { supabase } from "../services/supabaseClient";

function Chart() {
  const [data, setData] = useState([]);
  //   const [loading, setLoading] = useState(true);

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

  let chartData = chartCalc(data);
  return (
    <section className="chart">
      <h2>Received</h2>
      <h2>{chartData[0]}</h2>
      <hr></hr>
      <div className="chart-title-l">On hold</div>
      <div className="chart-title-l total">{Math.round(chartData[1])}%</div>
      <div className="w3-border">
        <div
          style={{
            width: isNaN(chartData[1]) ? "0%" : `${chartData[1]}%`,
          }}
          className="w3-grey hold"
        ></div>
      </div>
      <div className="chart-title-l">Reviewed</div>
      <div className="chart-title-l total">{Math.round(chartData[2])}%</div>
      <div className="w3-border">
        <div
          style={{
            width: isNaN(chartData[2]) ? "0%" : `${chartData[2]}%`,
          }}
          className="w3-grey reviewed"
        ></div>
      </div>
      <div className="chart-title-l">Sent</div>
      <div className="chart-title-l total">{Math.round(chartData[3])}%</div>
      <div className="w3-border">
        <div
          style={{
            width: isNaN(chartData[3]) ? "0%" : `${chartData[3]}%`,
          }}
          className="w3-grey sent"
        ></div>
      </div>
      <div className="chart-title-l">Agreed</div>
      <div className="chart-title-l total">{Math.round(chartData[4])}%</div>
      <div className="w3-border">
        <div
          style={{
            width: isNaN(chartData[4]) ? "0%" : `${chartData[4]}%`,
          }}
          className="w3-grey agreed"
        ></div>
      </div>
    </section>
  );
}

function chartCalc(data) {
  let dataLenth = data.length;
  let hold =
    (data.filter((item) => item.status === 0).length * 100) / dataLenth;
  let reviewed =
    (data.filter((item) => item.status === 1).length * 100) / dataLenth;
  let sent =
    (data.filter((item) => item.status === 2).length * 100) / dataLenth;
  let agreed =
    (data.filter((item) => item.status === 3).length * 100) / dataLenth;
  return [dataLenth, hold, reviewed, sent, agreed];
}
export default Chart;
