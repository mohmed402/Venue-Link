import Input from "@/components/input";
import Tooltip from "./Tooltip";
import "@/styles/joinInfoForm.css";

export default function JoinInfoForm() {
  return (
    <div className="venue-info-contaner">
      <form>
        <label>Venue Name</label>
        <Input
          type={"text"}
          value={"Venue Name"}
          id={"date"}
          width={"99%"}
          height={50}
        />
        <label>
          Venue Title
          <Tooltip
            text={
              "This title will be visible to users when your venue is displayed."
            }
          />
        </label>
        <Input
          type={"text"}
          value={"Venue Title"}
          id={"date"}
          width={"99%"}
          height={50}
        />
        <label>About the space</label>

        <textarea
          placeholder=" Describe the place, tell the customer why they should book with you"
          rows={10}
          cols={60}
        ></textarea>
      </form>
    </div>
  );
}
