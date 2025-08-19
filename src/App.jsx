import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  useNavigate,
} from "react-router-dom";
import Header from "./components/Header";
import DigiList from "./components/DigiList";
import DigiInput from "./components/DigiInput";
import DigiDetail from "./components/DigiDetail";

import Footer from "./components/Footer";

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAttribute, setSelectedAttribute] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  return (
    <>
      <Router>
        <Header />
        {/* DigiInput allows the user to type in the searchbar, it is defined on the app so it is accessible by DigiList */}
        <DigiInput
          setSearchTerm={setSearchTerm}
          searchTerm={searchTerm}
          selectedAttribute={selectedAttribute}
          setSelectedAttribute={setSelectedAttribute}
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
        />
        {/* The core of the app, it is where the main data of the digimon is fetched and the grid is generated */}
        <div className="digimon-grid-wrapper">
          <DigiList
            searchTerm={searchTerm}
            selectedAttribute={selectedAttribute}
            selectedLevel={selectedLevel}
          />
        </div>
        <Footer />
        <Routes>
          {/* Default route */}
          <Route path="/" element={null} />
          {/* Dynamic route for individual Digimon */}
          <Route path="/digimon/:id" element={<DigiDetail />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
