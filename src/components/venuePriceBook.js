import "../styles/venueInfoBook.css";

export default function VenuePriceBook() {
  return (
    <section className="price-deailts">
      <hr className="price-hr-line"></hr>
      <h3>Price Details</h3>
      <div>
        <p>£{1200} x 1 days</p>
        <p>£{1200}</p>
      </div>
      <hr></hr>
      <div>
        <h4>Total (GBP)</h4>
        <h4>£{1200}</h4>
      </div>
    </section>
  );
}
