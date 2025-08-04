import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import digimonNames from "../assets/digimonNames.json";

const PAGE_SIZE = 30;

const DigiList = ({ searchTerm }) => {
  const [loading, setLoading] = useState(true);
  const [digimonList, setDigimonList] = useState([]); // minimal info list
  const [loadedDigimons, setLoadedDigimons] = useState(() => {
    const saved = localStorage.getItem("loadedDigimons");
    return saved ? JSON.parse(saved) : [];
  });

  const [page, setPage] = useState(0);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const isFetchingRef = useRef(false); // track ongoing fetch to prevent duplicates

  useEffect(() => {
    const fetchFullList = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          "https://digi-api.com/api/v1/digimon?pageSize=2000"
        );
        const data = await res.json();
        const minimalList = data.content.map((d) => ({
          id: d.id,
          name: d.name,
          image: d.images?.[0]?.href || null,
        }));
        setDigimonList(minimalList);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };
    fetchFullList();
  }, []);

  useEffect(() => {
    localStorage.setItem("loadedDigimons", JSON.stringify(loadedDigimons));
  }, [loadedDigimons]);

  useEffect(() => {
    if (!searchTerm.trim()) return;

    const handler = setTimeout(async () => {
      const lowerSearch = searchTerm.toLowerCase();

      // Find all matches
      const matches = digimonNames.filter(
        (d) =>
          d.name.toLowerCase().includes(lowerSearch) ||
          d.id.toString() === searchTerm.trim()
      );

      // Prepare arrays for cached and missing Digimon
      const cachedDigimons = [];
      const missingIds = [];

      matches.forEach((m) => {
        const cached = localStorage.getItem(`digimon-${m.id}`);
        if (cached) {
          cachedDigimons.push(JSON.parse(cached));
        } else if (!loadedDigimons.some((d) => d.id === m.id)) {
          missingIds.push(m.id);
        }
      });

      if (missingIds.length === 0 && cachedDigimons.length === 0) return;

      // Fetch missing Digimon from API
      const fetchedDigimons = await Promise.all(
        missingIds.map((id) =>
          fetch(`https://digi-api.com/api/v1/digimon/${id}`)
            .then((res) => res.json())
            .then((data) => {
              const digimon = {
                id: data.id,
                name: data.name,
                image: data.images[0]?.href || null,
              };
              localStorage.setItem(
                `digimon-${digimon.id}`,
                JSON.stringify(digimon)
              );
              return digimon;
            })
            .catch(() => null)
        )
      );

      // Combine cached and newly fetched Digimon, filter out any nulls
      const newDigimons = [
        ...cachedDigimons,
        ...fetchedDigimons.filter(Boolean),
      ];

      // Add them to loadedDigimons, avoiding duplicates
      setLoadedDigimons((prev) => {
        const existingIds = new Set(prev.map((d) => d.id));
        const filteredNew = newDigimons.filter((d) => !existingIds.has(d.id));
        return [...prev, ...filteredNew];
      });
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, digimonNames, loadedDigimons]);

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

  const loadMoreDigimons = async () => {
    if (isFetchingRef.current) return; // already fetching, ignore
    if (page * PAGE_SIZE >= digimonList.length) return; // no more to load

    isFetchingRef.current = true;
    setLoading(true);

    const start = page * PAGE_SIZE;
    const end = Math.min(start + PAGE_SIZE, digimonList.length);
    const idsToLoad = digimonList.slice(start, end).map((d) => d.id);

    try {
      const promises = idsToLoad.map((id) => fetchDigimonDetails(id));
      const newDigimons = (await Promise.all(promises)).filter(Boolean);

      // Append only digimons that are not already loaded (avoid duplicates)
      setLoadedDigimons((prev) => {
        const existingIds = new Set(prev.map((d) => d.id));
        const filteredNew = newDigimons.filter((d) => !existingIds.has(d.id));
        return [...prev, ...filteredNew];
      });

      setPage((prev) => prev + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  // Load first page after minimal list loads
  useEffect(() => {
    if (digimonList.length > 0) {
      loadMoreDigimons();
    }
  }, [digimonList]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
      loadMoreDigimons();
    }
  };

  if (loading && loadedDigimons.length === 0) {
    return (
      <div className="loading-container">
        <p>Loading Digimon...</p>
      </div>
    );
  }

  const filteredDigimons = loadedDigimons
    .filter(
      (d) =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.id.toString() === searchTerm.trim()
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div
      className="digimon-grid"
      onScroll={handleScroll}
      ref={containerRef}
      style={{ height: "670px", overflowY: "auto" }}
    >
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
      {loading && <p>Loading more Digimon...</p>}
    </div>
  );
};

export default DigiList;
