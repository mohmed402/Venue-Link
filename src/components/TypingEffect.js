import { useState, useEffect } from "react";

export default function TypingEffect({
  words,
  speed = 100,
  eraseSpeed = 50,
  delay = 1500,
}) {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    let timeout;

    if (typing) {
      if (displayedText.length < words[wordIndex].length) {
        timeout = setTimeout(() => {
          setDisplayedText(words[wordIndex].slice(0, displayedText.length + 1));
        }, speed);
      } else {
        timeout = setTimeout(() => setTyping(false), delay);
      }
    } else {
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(words[wordIndex].slice(0, displayedText.length - 1));
        }, eraseSpeed);
      } else {
        setTyping(true);
        setWordIndex((prevIndex) => (prevIndex + 1) % words.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedText, typing, wordIndex, words, speed, eraseSpeed, delay]);

  return (
    <h1 className="typing-effect">
      {displayedText}
      <span className="cursor">|</span>
    </h1>
  );
}
