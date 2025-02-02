import { useState, useEffect } from "react";
export function useMovies(query, callBck) {
  const KEY = "98f08ad2";
  const [movies, setMovies] = useState([]);
  // const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      callBck?.();
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsLoading(true);
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok) {
            throw new Error("Something went wrong With getting The movies");
          }

          const data = await res.json();
          if (data.Response === "False") {
            throw new Error(
              data.Error || "No movies found for the given query."
            );
          }

          setMovies(data.Search);
          console.log(data.Search);
          // setIsLoading(false)
        } catch (err) {
          console.log("Error caught:", err.message);
          setError(err.message);
          setMovies([]);
        } finally {
          setIsLoading(false);
          setError("");
        }
      }
      if (query.length < 2) {
        setMovies([]);
        setError("");
        return;
      }
      fetchMovies();
      return function () {
        controller.abort();
      };
    },
    [query]
  );
  return { movies, error, isLoading, setMovies };
}
