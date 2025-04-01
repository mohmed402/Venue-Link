import "../styles/checkBox.css";

const Checkbox = ({ onChange, isChecked }) => {
  return (
    <input
      type="checkbox"
      className="ui-checkbox"
      onChange={onChange}
      checked={isChecked}
    />
  );
};

export default Checkbox;
