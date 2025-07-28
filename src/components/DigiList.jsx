import React, { useEffect, useState } from "react";

const TOTAL_DIGIMON = 50;

const DigiList = (props) => {
  const { searchTerm } = props;
  const [loading, setLoading] = useState(true);
  const [digimons, setDigimons] = useState([]);

  useEffect(() => {
    const fetchDigimons = async () => {
      const promises = [];

      for (let i = 1; i <= TOTAL_DIGIMON; i++) {
        const cached = localStorage.getItem(`digimon-${i}`);

        if (cached) {
          const parsed = JSON.parse(cached);
          promises.push(Promise.resolve(parsed));
        } else {
          promises.push(
            fetch(`https://digi-api.com/api/v1/digimon/${i}`)
              .then((res) => res.json())
              .then((data) => {
                const digimon = {
                  id: data.id,
                  name: data.name,
                  image: data.images[0]?.href || null,
                };
                localStorage.setItem(`digimon-${i}`, JSON.stringify(digimon));
                return digimon;
              })
              .catch(() => null)
          );
        }
      }

      const results = await Promise.all(promises);
      setDigimons(results.filter(Boolean));
      setLoading(false);
    };

    fetchDigimons();
  }, []);

  if (loading)
    return (
      <div className="loading-container">
        <p>Loading Digimon...</p>
      </div>
    );

  const filteredDigimons = digimons.filter((digi) => {
    const term = searchTerm.toLowerCase().trim();

    return (
      digi.name.toLowerCase().includes(term) ||
      digi.id.toString().includes(term)
    );
  });

  return (
    <>
      <div className="digimon-grid">
        {filteredDigimons.map((digi) => (
          <button key={digi.id} className="digimon-button">
            {digi.image && (
              <img src={digi.image} alt={digi.name} className="digimon-image" />
            )}
            <div className="digimon-popup">
              #{digi.id} — {digi.name}
            </div>
          </button>
        ))}
      </div>
    </>
  );
};

export default DigiList;
