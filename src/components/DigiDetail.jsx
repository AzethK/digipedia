// DigimonModal.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const DigimonModal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [digimon, setDigimon] = useState(null);
  const [showEvolutions, setShowEvolutions] = useState(false);

  useEffect(() => {
    const loadDigimon = async () => {
      const key = `digimon-${id}`;
      const cached = localStorage.getItem(key);

      let digimon = cached ? JSON.parse(cached) : null;

      const hasFullDetails =
        digimon &&
        digimon.level &&
        digimon.types &&
        digimon.attributes &&
        digimon.fields &&
        digimon.descriptions &&
        digimon.skills &&
        digimon.priorEvolutions !== undefined &&
        digimon.nextEvolutions !== undefined;

      if (!hasFullDetails) {
        try {
          const res = await fetch(`https://digi-api.com/api/v1/digimon/${id}`);
          const data = await res.json();

          const fullDigimon = {
            id: data.id,
            name: data.name,
            image: data.images[0]?.href || null,
            levels: data.levels || [],
            types: data.types || [],
            attributes: data.attributes || [],
            fields: data.fields || [],
            descriptions: data.descriptions || [],
            skills: data.skills || [],
            priorEvolutions: data.priorEvolutions || [],
            nextEvolutions: data.nextEvolutions || [],
          };

          // Merge with existing partial data (if any)
          const merged = { ...digimon, ...fullDigimon };

          // Save updated data
          localStorage.setItem(key, JSON.stringify(merged));

          setDigimon(merged);
        } catch (error) {
          console.error("Error fetching Digimon details:", error);
        }
      } else {
        setDigimon(digimon);
      }
    };

    loadDigimon();
  }, [id]);

  const closeModal = () => navigate("/");

  if (!digimon) return null;

  return (
    <div className="modal-overlay" onClick={closeModal}>
      {showEvolutions && (
        <div className="evolution-panel">
          <h3>Prior Evolutions</h3>
          <ul>
            {digimon.priorEvolutions.map((evo, index) => (
              <li key={index}>{evo.digimon}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="modal-container">
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button
            className="evolution-toggle"
            onClick={() => setShowEvolutions(!showEvolutions)}
          >
            {showEvolutions ? "\u25B6" : "\u25C0"}
          </button>
          <span className="close-x" onClick={closeModal}>
            ×
          </span>
          <h2>{digimon.name}</h2>
          <div className="digimon-image-wrapper">
            {digimon.image && <img src={digimon.image} alt={digimon.name} />}
          </div>
          <p>
            <strong>Level:</strong>{" "}
            {digimon.levels && digimon.levels.length > 0
              ? digimon.levels.map((l) => l.level).join(", ")
              : "N/A"}
          </p>

          <p>
            <strong>Type:</strong>{" "}
            {digimon.types && digimon.types.length > 0
              ? digimon.types.map((t) => t.type).join(", ")
              : "N/A"}
          </p>

          <p>
            <strong>Attribute:</strong>{" "}
            {digimon.attributes && digimon.attributes.length > 0
              ? digimon.attributes.map((a) => a.attribute).join(", ")
              : "N/A"}
          </p>

          <p>
            <strong>Fields:</strong>
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "4px",
            }}
          >
            {digimon.fields && digimon.fields.length > 0 ? (
              digimon.fields.map((field) => (
                <img
                  key={field.id}
                  src={field.image}
                  alt={field.name}
                  title={field.name}
                  style={{
                    width: "40px",
                    height: "40px",
                    objectFit: "contain",
                    paddingBottom: "10px",
                  }}
                />
              ))
            ) : (
              <span>
                N/A<p></p>
              </span>
            )}
          </div>

          {/* Add more digimon info as needed */}
        </div>
      </div>
    </div>
  );
};

export default DigimonModal;
