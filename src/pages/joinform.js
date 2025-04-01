import Button from "../components/button";
import "@/styles/joinform.css";
import Logo from "@/components/logo";
import MapLocation from "@/components/MapLocation";
import QuestionJoin from "@/components/questionJoin";
import { useEffect, useState } from "react";

let data = [];
export default function Joinform() {
  const [question, setQuestion] = useState(0);
  const [selectedValue, setSelectedValue] = useState("");
  const [inputData, setInputData] = useState([]);
  function addData() {
    setQuestion(question + 1);
    data.push(selectedValue);
    setInputData(data);
    // setSelectedValue("");
  }

  useEffect(() => {
    console.log(inputData);
  }, [inputData]);

  return (
    <>
      <header>
        <Logo background={false} />
      </header>
      <main className="joinform-main">
        <QuestionJoin
          questionNum={question}
          selectedValue={selectedValue}
          setSelectedValue={setSelectedValue}
        />
        {/* <MapLocation /> */}
      </main>
      <footer className="joinform-footer">
        {question >= 1 ? (
          <Button
            title={`Back`}
            width={300}
            height={80}
            colour={"main"}
            classN={"back-btn"}
            click={() => setQuestion(question - 1)}
          />
        ) : (
          <Button
            title={`Exit`}
            width={300}
            height={80}
            colour={"main"}
            classN={"back-btn"}
            page={"join"}
          />
        )}
        <Button
          title={`Next`}
          width={300}
          height={80}
          colour={"main"}
          classN={"next-btn"}
          click={selectedValue && (() => addData())}
        />
      </footer>
    </>
  );
}
