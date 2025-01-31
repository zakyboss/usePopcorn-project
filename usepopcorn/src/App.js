import { Children, useEffect, useState } from "react";
import StarsRating from "./Stars";
// const tempMovieData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt0133093",
//     Title: "The Matrix",
//     Year: "1999",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt6751668",
//     Title: "Parasite",
//     Year: "2019",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
//   },
// ];

// const tempWatchedData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//     runtime: 148,
//     imdbRating: 8.8,
//     userRating: 10,
//   },
//   {
//     imdbID: "tt0088763",
//     Title: "Back to the Future",
//     Year: "1985",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
//     runtime: 116,
//     imdbRating: 8.5,
//     userRating: 9,
//   },
// ];

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
  const [userRating, setUserRating] = useState(0);
  const [title, setTitle] = useState("");
  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
    setSelectedId("");
  }

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
  // Delete watched movie from watched movie list
  function handleDeleteWatched(id) {
    setWatched((watched) => [
      ...watched.filter((movie) => movie.imdbID !== id),
    ]);
  }
  //     Updating movie title
  useEffect(() => {
    if (!selectedId) {
      return;
    }
    const movieBeingWatched = movies.find(
      (movie) => movie.imdbID === selectedId
    );
    if (!movieBeingWatched) {
      return;
    }
    setTitle(() => movieBeingWatched.Title);

    return () => {
      setTitle("");
    };
  }, [selectedId, setTitle]);

  useEffect(() => {
    const originalTitle = document.title;
    if (!title) {
      return;
    }
    document.title = `Movie:${title}`;
    return function () {
      document.title = originalTitle;
    };
  }, [title]);
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
                onAddWatched={handleAddWatched}
                userRating={userRating}
                setUserRating={setUserRating}
                watched={watched}
              />
            ) : (
              <>
                <Summary watched={watched} />
                <WatchedMovieList
                  watched={watched}
                  userRating={userRating}
                  onDeleteWatched={handleDeleteWatched}
                />
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
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handleSelectID={handleSelectID}
        />
      ))}
    </ul>
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

function MovieDetails({
  selectedId,
  onCloseMovie,
  movie,
  setMovie,
  onAddWatched,
  userRating,
  setUserRating,
  watched,
}) {
  const [isLoading, setLoading] = useState(false);
  useEffect(
    function () {
      async function getMovieDetails() {
        setLoading(true);
        setUserRating("");
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await res.json();

        setMovie(data);
        // console.log(movie);
        setLoading(false);
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
    imdbRating: rating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;
  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title: title,
      year,
      poster,
      imdbRating: Number(rating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating: userRating,
    };
    if (
      userRating < 1 ||
      watched.some((movie) => movie.imdbID === selectedId)
    ) {
      return;
    }
    onAddWatched(newWatchedMovie);
  }

  const isInWatched = watched.map((movie) => movie.imdbID).includes(selectedId);

  const userWatchedRating = watched.filter(
    (movie) => movie.imdbID === selectedId
  )[0];

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
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
                <p>🌟{Math.floor(rating)}</p>
              </h2>
            </div>
          </header>
          <section>
            {isInWatched ? (
              <p
                style={{
                  backgroundColor: "grey",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                You rated this movie a
                <b style={{ marginLeft: "5px" }}>
                  {" "}
                  {userWatchedRating.userRating}
                </b>
              </p>
            ) : (
              <StarsRating
                maxRating={10}
                messages={["Awful", "Bad", "Good", "Better", "Amazing"]}
                size={24}
                userRating={userRating}
                setUserRating={setUserRating}
              />
            )}

            {userRating > 0 ? (
              <button className="btn-add" onClick={handleAdd}>
                Add to list
              </button>
            ) : (
              ""
            )}

            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directors {director}</p>
          </section>
        </>
      )}
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
          <span>{Math.floor(avgImdbRating)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{Math.floor(avgUserRating)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{Math.floor(avgRuntime)} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedMovieList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <li key={movie.imdbID}>
          <img src={movie.poster} alt={`${movie.title} poster`} />
          <h3>{movie.title}</h3>

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
            <button
              className="btn-delete"
              onClick={() => onDeleteWatched(movie.imdbID)}
            >
              X
            </button>
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
