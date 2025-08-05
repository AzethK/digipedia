import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TOTAL_DIGIMON = 200;
const CHUNK_SIZE = 20;

//this is all for testing purposes only

const DigiList = (props) => {
  const { searchTerm } = props;
  const [loading, setLoading] = useState(true);
  const [digimons, setDigimons] = useState([]);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const fetchDigimons = async () => {
  //     const promises = [];

  //     for (let i = 1; i <= TOTAL_DIGIMON; i++) {
  //       const cached = localStorage.getItem(`digimon-${i}`);

  //       if (cached) {
  //         const parsed = JSON.parse(cached);
  //         promises.push(Promise.resolve(parsed));
  //       } else {
  //         promises.push(
  //           fetch(`https://digi-api.com/api/v1/digimon/${i}`)
  //             .then((res) => res.json())
  //             .then((data) => {
  //               const digimon = {
  //                 id: data.id,
  //                 name: data.name,
  //                 image: data.images[0]?.href || null,
  //               };
  //               localStorage.setItem(`digimon-${i}`, JSON.stringify(digimon));
  //               return digimon;
  //             })
  //             .catch(() => null)
  //         );
  //       }
  //     }

  //     const results = await Promise.all(promises);
  //     setDigimons(results.filter(Boolean));
  //     setLoading(false);
  //   };

  //   fetchDigimons();
  // }, []);

  const fetchFullList = async () => {
    const res = await fetch("https://digi-api.com/api/v1/digimon?pageSize=300");
    const data = await res.json();

    return data.content.map((d) => ({
      id: d.id,
      name: d.name,
      image: d.images?.[0]?.href || null,
    }));
  };

  const fetchDigimonDetails = async (id) => {
    const cached = localStorage.getItem(`digimon-${id}`);
    if (cached) return JSON.parse(cached);

    const res = await fetch(`https://digi-api.com/api/v1/digimon/${id}`);
    if (!res.ok) return null;
    const data = await res.json();

    const digimon = {
      id: data.id,
      name: data.name,
      image: data.images?.[0]?.href || null,
    };

    localStorage.setItem(`digimon-${id}`, JSON.stringify(digimon));
    return digimon;
  };

  useEffect(() => {
    const fetchDigimons = async () => {
      setLoading(true);
      try {
        const list = await fetchFullList();

        const promises = list.map((d) => fetchDigimonDetails(d.id));

        const results = await Promise.all(promises);

        setDigimons(results.filter(Boolean));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDigimons();
  }, []);

  if (loading)
    return (
      <div className="loading-container">
        <p>Loading Digimon...</p>
      </div>
    );

  const filteredDigimons = digimons
    .filter(
      (d) =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.id.toString() === searchTerm.trim()
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <div className="digimon-grid">
        {filteredDigimons.map((digi) => (
          <button
            key={digi.id}
            className="digimon-button"
            onClick={() => navigate(`/digimon/${digi.id}`)}
          >
            {digi.image && (
              <img src={digi.image} alt={digi.name} className="digimon-image" />
            )}
            <div className="digimon-popup">{digi.name}</div>
          </button>
        ))}
      </div>
    </>
  );
};

export default DigiList;
