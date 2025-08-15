import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 30;

const DigiList = ({ searchTerm, selectedLevel, selectedAttribute }) => {
  const [loading, setLoading] = useState(true);
  const [digimonList, setDigimonList] = useState([]); // minimal list
  const [loadedDigimons, setLoadedDigimons] = useState([]); // digimon visible in grid
  const [page, setPage] = useState(0);

  const containerRef = useRef(null);
  const isFetchingRef = useRef(false);
  const navigate = useNavigate();

  //Fetch minimal list based on filters
  const fetchFilteredList = async (level, attribute) => {
    // If both filters are applied, try API combined query first
    if (level && attribute) {
      try {
        const res = await fetch(
          `https://digi-api.com/api/v1/digimon?level=${encodeURIComponent(
            level
          )}&attribute=${encodeURIComponent(attribute)}&pageSize=2000`
        );
        const data = await res.json();
        if (data?.content?.length > 0) {
          return data.content.map((d) => ({
            id: d.id,
            name: d.name,
            image: d.images?.[0]?.href || null,
          }));
        }
      } catch (err) {
        console.warn(
          "Combined query failed, falling back to intersection.",
          err
        );
      }

      //Fallback: fetch separately and intersect
      const [levelList, attrList] = await Promise.all([
        fetchFilteredList(level, null),
        fetchFilteredList(null, attribute),
      ]);
      const attrIds = new Set(attrList.map((d) => d.id));
      return levelList.filter((d) => attrIds.has(d.id));
    }

    //Single filter or no filter
    const params = new URLSearchParams();
    if (attribute) params.append("attribute", attribute);
    if (level) params.append("level", level);

    const res = await fetch(
      `https://digi-api.com/api/v1/digimon?${params.toString()}&pageSize=2000`
    );
    const data = await res.json();
    return data.content.map((d) => ({
      id: d.id,
      name: d.name,
      image: d.images?.[0]?.href || null,
    }));
  };

  //Fetch details for a single Digimon
  const fetchDigimonDetails = async (id) => {
    const cached = localStorage.getItem(`digimon-${id}`);
    if (cached) return JSON.parse(cached);

    try {
      const res = await fetch(`https://digi-api.com/api/v1/digimon/${id}`);
      const data = await res.json();
      const digimon = {
        id: data.id,
        name: data.name,
        image: data.images?.[0]?.href || null,
      };
      localStorage.setItem(`digimon-${id}`, JSON.stringify(digimon));
      return digimon;
    } catch {
      return null;
    }
  };

  //Load more Digimon for infinite scroll
  const loadMoreDigimons = async () => {
    if (isFetchingRef.current || page * PAGE_SIZE >= digimonList.length) return;

    isFetchingRef.current = true;
    setLoading(true);

    const start = page * PAGE_SIZE;
    const end = Math.min(start + PAGE_SIZE, digimonList.length);
    const idsToLoad = digimonList.slice(start, end).map((d) => d.id);

    const newDigimons = (
      await Promise.all(idsToLoad.map(fetchDigimonDetails))
    ).filter(Boolean);

    setLoadedDigimons((prev) => {
      const existingIds = new Set(prev.map((d) => d.id));
      return [...prev, ...newDigimons.filter((d) => !existingIds.has(d.id))];
    });

    setPage((prev) => prev + 1);
    isFetchingRef.current = false;
    setLoading(false);
  };

  //Reset list when filters change
  useEffect(() => {
    const loadFilteredList = async () => {
      setLoading(true);
      setPage(0);
      isFetchingRef.current = false;
      setLoadedDigimons([]);

      const minimalList = await fetchFilteredList(
        selectedLevel,
        selectedAttribute
      );
      setDigimonList(minimalList);

      setLoading(false);
    };

    loadFilteredList();
  }, [selectedLevel, selectedAttribute]);

  //Load more when minimal list changes
  useEffect(() => {
    if (digimonList.length > 0) {
      loadMoreDigimons();
    }
  }, [digimonList]);

  //Scroll listener
  const handleScroll = () => {
    const el = containerRef.current;
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      loadMoreDigimons();
    }
  };

  //Search effect
  useEffect(() => {
    if (!searchTerm.trim()) return;

    const handler = setTimeout(async () => {
      const lowerSearch = searchTerm.toLowerCase();
      const matches = digimonList.filter(
        (d) =>
          d.name.toLowerCase().includes(lowerSearch) ||
          d.id.toString() === searchTerm.trim()
      );

      const cached = [];
      const toFetch = [];

      matches.forEach((m) => {
        const stored = localStorage.getItem(`digimon-${m.id}`);
        if (stored) {
          cached.push(JSON.parse(stored));
        } else if (!loadedDigimons.some((d) => d.id === m.id)) {
          toFetch.push(m.id);
        }
      });

      const fetched = await Promise.all(toFetch.map(fetchDigimonDetails));
      const newDigimons = [...cached, ...fetched.filter(Boolean)];

      setLoadedDigimons((prev) => {
        const existingIds = new Set(prev.map((d) => d.id));
        return [...prev, ...newDigimons.filter((d) => !existingIds.has(d.id))];
      });
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, digimonList]);

  //Filtered list for rendering
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
