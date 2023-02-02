import "./App.css";
import React from "react";
import { Routes, Route } from "react-router-dom";
import { ReactP5Wrapper as P5Wrapper } from "react-p5-wrapper";
import PekSnek from "./Components/PekSnek/PekSnek";

function App() {
  return (
    <div className="App">
      <header className="App-header"></header>
      <main>
        <Routes>
          <Route path="/" element={<PekSnek />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
