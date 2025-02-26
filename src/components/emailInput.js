import Input from "@/components/input";

export default function EmailInput() {
  return (
    <div className="input-container em">
      {/* <div className="country-code">+44</div> */}
      <Input
        type={"text"}
        value={"Email"}
        id={"Email"}
        classN={"email-input input-field"}
      />
      <label for="input-field" className="input-label">
        Email
      </label>
    </div>
  );
}
