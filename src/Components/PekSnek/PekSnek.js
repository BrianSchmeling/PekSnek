import React from "react";
import { ReactP5Wrapper as P5Wrapper } from "react-p5-wrapper";
import sketch from "../Sketch/Sketch";
import "./PekSnek.css";

const PekSnek = () => {
  return (
    <div>
      <div className="game-container">
        <div className="game-board">
          <P5Wrapper sketch={sketch} />
        </div>
      </div>
    </div>
  );
};

export default PekSnek;
