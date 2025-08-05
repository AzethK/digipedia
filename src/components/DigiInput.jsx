import React, { useEffect } from "react";

const DigiInput = (props) => {
  const { searchTerm, setSearchTerm } = props;

  //Whenever searchTerm is updated scroll the grid back to the top
  useEffect(() => {
    const grid = document.querySelector(".digimon-grid");
    if (grid) grid.scrollTop = 0;
  }, [searchTerm]);

  return (
    //sets searchTerm whenever there's a change in the input
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
