import { Children, useEffect, useState } from "react";
import StarsRating from "./Stars";
const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const KEY = "98f08ad2";
export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("tt0424095");
  const [movie, setMovie] = useState({});
  useEffect(
    function () {
      async function fetchMovies() {
        try {
          setIsLoading(true);
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`
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
    },
    [query]
  );

  function handleSelectID(id) {
    setSelectedId((sel) => (sel === id ? null : id));
  }
  function handleCloseMovie() {
    setSelectedId(null);
  }
  return (
    <>
      <Navbar>
        <Search query={query} setQuery={setQuery} />
        {!error && <NumResults movies={movies} />}
      </Navbar>

      <Main>
        <Box>
          {isLoading && <Loader />}
          <ul>
            {!isLoading && !error && (
              <MovieLists movies={movies} handleSelectID={handleSelectID} />
            )}
          </ul>
          {error && <Error message={error} />}
        </Box>
        <Box>
          <ul>
            {selectedId ? (
              <MovieDetails
                selectedId={selectedId}
                onClick={handleSelectID}
                onCloseMovie={handleCloseMovie}
                movie={movie}
                setMovie={setMovie}
              />
            ) : (
              <>
                <Summary watched={watched} />
                <WatchedMovieList watched={watched} />
              </>
            )}
          </ul>
        </Box>
      </Main>
    </>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}
function Navbar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function MovieLists({ movies, handleSelectID }) {
  return (
    <li className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handleSelectID={handleSelectID}
        />
      ))}
    </li>
  );
}
function Movie({ movie, handleSelectID }) {
  return (
    <li onClick={() => handleSelectID(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieDetails({ selectedId, onCloseMovie, movie, setMovie }) {
  useEffect(
    function () {
      async function getMovieDetails() {
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await res.json();

        setMovie(data);
        console.log(movie);
      }
      if (!movie) {
        onCloseMovie();
        return;
      }
      getMovieDetails();
    },
    [selectedId, setMovie]
  );
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating:rating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;
  return (
    <div className="details">
      <header>
        <button className="btn-back" onClick={() => onCloseMovie()}>
          {" "}
          &larr;
        </button>
        <img src={poster} alt={`Poster of ${movie} movie`} />
        <div className="details-overview">
          <h2>
            {title}
            <p>
              {released} &bull; {runtime}
            </p>
            <p>{genre}</p>
            <p>🌟{rating}</p>
          </h2>
          <StarsRating maxRating={5} messages={["Awful", "Bad", "Good", "Better", "Amazing"]} />
        </div>
      </header>
      <section>
        <p><em>{plot}</em></p>
        <p>Starring {actors}</p>
         <p>Directors {director}</p>
        <p>{runtime}</p>
      </section>
    </div>
  );
}
function Summary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedMovieList({ watched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <li key={movie.imdbID}>
          <img src={movie.Poster} alt={`${movie.Title} poster`} />
          <h3>{movie.Title}</h3>
          
          <div>
            <p>
              <span>⭐️</span>
              <span>{movie.imdbRating}</span>
            </p>
            <p>
              <span>🌟</span>
              <span>{movie.userRating}</span>
            </p>
            <p>
              <span>⏳</span>
              <span>{movie.runtime} min</span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}
function Error({ message }) {
  return (
    <p className="error">
      <span>{message}</span>
    </p>
  );
}
