import Image from "next/image";

export default function VenueFacilities({ facilities }) {
  const facilityIcons = {
    inHouseCatering: "/assets/inHouseCatering.png",
    externalCateringNotAllowed: "/assets/noCatering.png",
    venueProvidesDrinks: "/assets/providesDrink.png",
  };

  const facilitiesSettings = [
    {
      key: "inHouseCatering",
      name: "In-house catering",
      icon: facilityIcons.inHouseCatering,
    },
    {
      key: "externalCateringNotAllowed",
      name: "External catering not allowed",
      icon: facilityIcons.externalCateringNotAllowed,
    },
    {
      key: "venueProvidesDrinks",
      name: "Venue provides drinks",
      icon: facilityIcons.venueProvidesDrinks,
    },
  ];

  return (
    <section>
      <hr className="sec-line" />
      <h3>Catering and drinks</h3>
      <section className="facilities-container">
        {facilitiesSettings.map(
          (facility) =>
            facilities[facility.key] && (
              <div key={facility.key} className="facility">
                <Image
                  src={facility.icon}
                  alt={facility.name}
                  width={35}
                  height={35}
                  aria-hidden
                />
                <p>{facility.name}</p>
              </div>
            )
        )}
      </section>
    </section>
  );
}
