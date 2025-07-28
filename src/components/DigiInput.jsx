import React, { useEffect } from "react";

const DigiInput = (props) => {
  const { searchTerm, setSearchTerm } = props;
  useEffect(() => {
    const grid = document.querySelector(".digimon-grid");
    if (grid) grid.scrollTop = 0;
  }, [searchTerm]);

  return (
    <div className="digi-input-container">
      <input
        type="text"
        placeholder="Search Digimon..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="digi-input"
      />
    </div>
  );
};

export default DigiInput;
