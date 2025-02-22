"use client";
import { createContext, useContext, useState } from "react";

const NavContext = createContext();

export function NavProvider({ children }) {
  const [navOpen, setNavOpen] = useState(false);

  function toggleNav() {
    setNavOpen((prev) => !prev);
  }

  return (
    <NavContext.Provider value={{ navOpen, toggleNav }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNavHandler() {
  // console.log("this ", NavContext);
  return useContext(NavContext);
}
