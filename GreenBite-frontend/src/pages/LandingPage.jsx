import React from "react";
import { useEffect, useState } from "react";
import NavBar from "../components/LandingPage/NavBar";
const LandingPage = () => {
  let [i, seti] = useState(50);
  let [att, setAtt] = useState();
  useEffect(() => {
    new Promise((resolve, reject) => {
      if (i <= 50) {
        resolve();
      } else {
        reject();
      }
    })
      .then(() => {
        console.log("resolved");
      })
      .catch(() => {
        console.log("rejected");
      });
  });
  function addpulstonumber() {
    seti(i + 10);
  }
  function neg() {
    seti(i - 10);
  }

  let sendatt = (att) => {
    console.log(att);
    setAtt(att);
  };
  return (
    <>
      <NavBar messge={i} getdata={sendatt} />
      <button
        onClick={() => {
          addpulstonumber();
        }}
      >
        add
        {att}
      </button>
      <button onClick={() => neg()}>neg</button>
    </>
  );
};

export default LandingPage;
