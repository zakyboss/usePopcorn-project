import { Children, useEffect, useRef, useState } from "react";
import StarsRating from "./Stars";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [movie, setMovie] = useState({});
  const [userRating, setUserRating] = useState(0);
  const [title, setTitle] = useState("");

  const { movies, error, isLoading, setMovies } = useMovies(
    query,
    handleCloseMovie
  );
  const [watched, setWatched] = useLocalStorageState([],'watched');
  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
    setSelectedId("");
  }

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
        <Search
          query={query}
          setQuery={setQuery}
          setMovies={setMovies}
          handleCloseMovie={handleCloseMovie}
        />
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

function Search({ query, setQuery, setMovies, handleCloseMovie }) {
  const inputElement = useRef(null);

  useEffect(
    function () {
      document.addEventListener("keydown", function (e) {
        if (e.code === "Enter") {
          inputElement.current.focus();
        }
        if (e.code === "Escape") {
          inputElement.current.focus();
          setMovies([]);
          handleCloseMovie();
        }
      });
      console.log(inputElement);
    },
    [setMovies]
  );

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputElement}
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
  const KEY = "98f08ad2";

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
  useEffect(
    function () {
      function callBack(e) {
        if (e.code === "Escape") {
          onCloseMovie();
          console.log("Closing");
        }
      }
      document.addEventListener("keydown", callBack);
      return function () {
        document.removeEventListener("keydown", callBack);
      };
    },
    [onCloseMovie]
  );
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
