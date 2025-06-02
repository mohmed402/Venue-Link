import Button from "../components/button";
import "@/styles/joinform.css";
import Logo from "@/components/logo";
import uploadVenueData from "@/context/uploadVenueData";
import { useRouter } from "next/router";

import QuestionJoin from "@/components/questionJoin";
import { useEffect, useState } from "react";
import uploadVenueImages from "@/utils/uploadVenueImages";
import UnderReview from "@/components/UnderReview";

let data = [];
export default function Joinform() {
  const router = useRouter();
  const [question, setQuestion] = useState(0);
  const [selectedValue, setSelectedValue] = useState("");
  const [inputData, setInputData] = useState([]);
  const [userId, setUserId] = useState();
  const [formData, setFormData] = useState({});
  const [sent, setSent] = useState(false);

  function addData() {
    setQuestion(question + 1);
    data.push(selectedValue);
    setInputData(data);
    // setSelectedValue("");
  }

  async function handleClick() {
    const venue = await uploadVenueData(formData, userId);
    console.log(venue);
    const venueId = venue.id.venue_id;
    console.log(venueId);

    const imageUploadResult = await uploadVenueImages(venueId, formData.images);
    console.log(imageUploadResult);

    if (venue.success && imageUploadResult.success) {
      setSent(true);
    }
  }

  function handleStepData(key, value) {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  return (
    <>
      <header className="joinfrom-header">
        <Logo background={false} />
      </header>
      <main className="joinform-main">
        {sent ? (
          <UnderReview />
        ) : (
          <QuestionJoin
            questionNum={question}
            selectedValue={selectedValue}
            setSelectedValue={setSelectedValue}
            handleStepData={handleStepData}
            setUserId={setUserId}
          />
        )}
      </main>
      <footer className="joinform-footer">
        {sent ? (
          <Button
            title="Exit"
            width={300}
            height={80}
            colour="main"
            classN="next-btn"
            page="/"
          />
        ) : (
          <>
            {question >= 1 ? (
              <Button
                title="Back"
                width={300}
                height={80}
                colour="main"
                classN="back-btn"
                click={() => setQuestion(question - 1)}
              />
            ) : (
              <Button
                title="Exit"
                width={300}
                height={80}
                colour="main"
                classN="back-btn"
                page="join"
              />
            )}

            {question >= 15 ? (
              <Button
                title="Send"
                width={300}
                height={80}
                colour="main"
                classN="next-btn"
                click={() => handleClick()}
              />
            ) : (
              <Button
                title="Next"
                width={300}
                height={80}
                colour="main"
                classN="next-btn"
                click={selectedValue && (() => addData())}
              />
            )}
          </>
        )}
      </footer>
    </>
  );
}
