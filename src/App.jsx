import React, { useState } from "react";
import Header from "./components/Header";
import DigiList from "./components/DigiList";
import DigiInput from "./components/DigiInput";

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  return (
    <>
      <Header />
      <DigiInput setSearchTerm={setSearchTerm} searchTerm={searchTerm} />
      <div className="digimon-grid-wrapper">
        <DigiList searchTerm={searchTerm} />
      </div>
    </>
  );
};

export default App;
