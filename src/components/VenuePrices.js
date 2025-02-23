export default function VenuePrices() {
  const prices = [
    { day: "Monday", time: "18:00-23:00", price: "from £1000 hire fee" },
    { day: "Tuesday", time: "18:00-23:00", price: "from £1000 hire fee" },
    { day: "Wednesday", time: "18:00-23:00", price: "from £1000 hire fee" },
    { day: "Thursday", time: "18:00-23:00", price: "from £1000 hire fee" },
    { day: "Friday", time: "18:00-23:00", price: "from £1300 hire fee" },
    { day: "Saturday", time: "18:00-23:00", price: "from £1300 hire fee" },
    { day: "Sunday", time: "18:00-23:00", price: "from £1000 hire fee" },
  ];

  return (
    <section>
      <hr className="sec-line" />
      <h3>Prices</h3>
      <table className="price-table">
        <thead>
          <tr>
            <th>Day</th>
            <th>Time</th>
            <th>Price Starts from</th>
          </tr>
        </thead>
        <tbody>
          {prices.map((item, index) => (
            <tr key={index}>
              <td>{item.day}</td>
              <td>{item.time}</td>
              <td>{item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
