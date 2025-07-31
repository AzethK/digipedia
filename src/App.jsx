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

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  return (
    <>
      <Router>
        <Header />
        <DigiInput setSearchTerm={setSearchTerm} searchTerm={searchTerm} />
        <div className="digimon-grid-wrapper">
          <DigiList searchTerm={searchTerm} />
        </div>
        <Routes>
          <Route path="/digimon/:id" element={<DigiDetail />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
