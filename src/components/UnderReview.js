import Image from "next/image";

export default function UnderReview() {
  return (
    <section className="under-review-container">
      <h1>
        Thanks! Your venue details have been added and are now under review. One
        of our team members will approve it soon.
      </h1>

      <Image
        src="/assets/underReview.webp"
        alt={`background under review`}
        width={600}
        height={300}
        className="image"
      />
    </section>
  );
}
