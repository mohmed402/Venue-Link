export default function VenueAboutSpace({ description }) {
  const customDescription = `
    Work or play? We don’t really see the difference. Every moment
    at Oddfellows On The Park is designed for fun. Whole venue hire
    includes the hire of our event spaces: The Parlor Rooms, The
    Terrace, The Galloping Major Restaurant, and Parlor Bar. Whether
    it’s business, birthday party, board meeting, or entertaining
    clients, we promise that every experience at Oddfellows On The
    Park will be full of merriment and delivered to you by a
    dedicated and cheerful team. So come dine, drink, meet, wed,
    party, and play with us!
  `;

  return (
    <section>
      <hr className="sec-line" />
      <h3>About this space</h3>
      <p>{customDescription}</p>
    </section>
  );
}
