import { useEffect, useState } from "react";

const DigiInput = (props) => {
  const {
    searchTerm,
    setSearchTerm,
    selectedAttribute,
    setSelectedAttribute,
    selectedLevel,
    setSelectedLevel,
  } = props;
  const [showFilters, setShowFilters] = useState(false);

  // Local temporary state
  const [tempAttribute, setTempAttribute] = useState(selectedAttribute || "");
  const [tempLevel, setTempLevel] = useState(selectedLevel || "");

  const attributes = [
    "Data",
    "Free",
    "Virus",
    "Vaccine",
    "Unknown",
    "Variable",
    "No Data",
  ];

  const levels = [
    "Baby I",
    "Baby II",
    "Child",
    "Adult",
    "Perfect",
    "Ultimate",
    "Armor",
    "Hybrid",
    "Unknown",
  ];

  // Scroll the grid back to top whenever searchTerm changes
  useEffect(() => {
    const grid = document.querySelector(".digimon-grid");
    if (grid) grid.scrollTop = 0;
  }, [searchTerm]);

  //When the Apply button is pressed this function sets the filters using the values in the temporary variables
  const handleApplyFilters = () => {
    setSelectedAttribute(tempAttribute);
    setSelectedLevel(tempLevel);

    setShowFilters(false);
  };

  //When the Clear button is pressed all filters and temporary variables are reset
  function handleClearFilters() {
    setSelectedLevel("");
    setSelectedAttribute("");
    setTempAttribute("");
    setTempLevel("");
    setShowFilters(false);
  }

  return (
    <div className="digi-input-container">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search Digimon..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="digi-input"
      />

      {/* Toggle Filters Button */}
      <button
        className="filter-toggle-btn"
        onClick={() => setShowFilters(!showFilters)}
      >
        {showFilters ? "Hide filters" : "Display filters"}
      </button>

      {/* Filters Section */}
      {showFilters && (
        <div className="filters-container">
          <select
            className="filter-dropdown"
            value={tempAttribute}
            onChange={(e) => setTempAttribute(e.target.value)}
          >
            <option value="">Attribute</option>
            {attributes.map((attr) => (
              <option key={attr} value={attr}>
                {attr}
              </option>
            ))}
          </select>

          <select
            className="filter-dropdown"
            value={tempLevel}
            onChange={(e) => setTempLevel(e.target.value)}
          >
            <option value="">Level</option>
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>

          <button className="apply-filters-btn" onClick={handleApplyFilters}>
            Apply filters
          </button>

          <button className="apply-filters-btn" onClick={handleClearFilters}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default DigiInput;
