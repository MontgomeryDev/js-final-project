//http://www.omdbapi.com/?apikey=d3791b44&s=marvel

// async function fetchMovies(title, sortBy = "title") {
//     try {
//       const response = await fetch(`https://www.omdbapi.com/?apikey=d3791b44&s=${title}`);
//               if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         const data = await response.json();
//         const movies = data.Search.map((movie) => {
//           return {
//             title: movie.Title,
//             year: movie.Year,
//             poster: movie.Poster,
//             id: movie.imdbID
//           };
//         });
//     if (sortBy === "year") {
//       movies.sort((a, b) =>
//         Number(b.year) - Number(a.year)
//       );
//     }

//     return movies;

//   } catch (error) {
//     console.error("Error fetching movies:", error);
//     return [];
//   }
//          console.log(data);
// }

// fetchMovies("Batman", "title").then((movies) => {
//   console.log(movies);
// });

// Get HTML elements
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const movieContainer = document.getElementById("moviesGrid");
const message = document.getElementById("message");

// Store fetched movies
let movies = [];

// Track searches so older requests don't overwrite newer ones
let searchId = 0;

// Fetch movies from OMDb API
async function fetchMovies(title) {
  const response = await fetch(
    `https://www.omdbapi.com/?apikey=d3791b44&s=${encodeURIComponent(title)}`
  );

  if (!response.ok) {
    throw new Error("Network response was not OK");
  }

  const data = await response.json();

  // OMDb can return an error even with HTTP 200
  if (data.Response === "False") {
    throw new Error(data.Error || "No movies found");
  }

  // Transform API results into our own movie objects
  const movieResults = data.Search.map((movie) => {
    return {
      title: movie.Title,
      year: movie.Year,
      poster: movie.Poster,
      id: movie.imdbID
    };
  });

  return movieResults;
}

// Sort movies based on selected option
function sortMovies(movieList, sortBy) {
  // Copy array so original isn't modified
  const sorted = [...movieList];

  if (sortBy === "title") {
    // Alphabetical A-Z
    sorted.sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  }

  if (sortBy === "year") {
    // Newest first
    sorted.sort((a, b) =>
      parseInt(b.year, 10) - parseInt(a.year, 10)
    );
  }

  if (sortBy === "oldest") {
    // Oldest first
    sorted.sort((a, b) =>
      parseInt(a.year, 10) - parseInt(b.year, 10)
    );
  }

  return sorted;
}

// Display movies on the webpage
// function displayMovies(movieList) {
//   // Clear previous results
//   moviesGrid.innerHTML = movies.map((movie) => {
//       return `
//     <div class="movie-card">
//       <h2>${movie.title}</h2>
//       <p>${movie.year}</p>
//     </div>
//   `;
//   }).join("");

//   movieList.forEach((movie) => {
//     // Create movie card
//     const card = document.createElement("div");
//     card.classList.add("movie-card");

//     // Create movie poster
//     const poster = document.createElement("img");

//     poster.src =
//       movie.poster && movie.poster !== "N/A"
//         ? movie.poster
//         : "https://placehold.co/300x450?text=No+Poster";

//     poster.alt = movie.title;
//     poster.loading = "lazy";

//     // Create movie title
//     const heading = document.createElement("h2");
//     heading.textContent = movie.title;

//     // Create release year
//     const year = document.createElement("p");
//     year.textContent = `Released: ${movie.year}`;

//     // Add elements to card
//     card.append(poster, heading, year);

//     // Add card to webpage
//     movieContainer.appendChild(card);
//   });
// }

function displayMovies(movies) {
  const moviesGrid = document.getElementById("moviesGrid");

  moviesGrid.innerHTML = movies.map((movie) => {
    return `
      <div class="movie-card">
        ${
          movie.poster !== "N/A"
            ? `<img
                class="movie-card__img"
                src="${movie.poster}"
                alt="${movie.title}"
              />`
            : `<div class="movie-card__poster-placeholder">
                Movie Poster<br>Not Available
              </div>`
        }

        <h2 class="movie-card__title">${movie.title}</h2>
        <p class="movie-card__year">${movie.year}</p>
      </div>
    `;
  }).join("");
}

// Handle search form submission
searchForm.addEventListener("submit", async (event) => {
  // Prevent page refresh
  event.preventDefault();

  const title = searchInput.value.trim();

  if (!title) return;

  searchMovies(title);

  // Show loading message
  message.textContent = "Loading movies...";
  moviesGrid.innerHTML = "";

  try {
    // Fetch movies
    const results = await fetchMovies(title);

    // Ignore results from an outdated search
    if (currentSearch !== searchId) return;

    // Save movies
    movies = results;

    // Sort using current dropdown selection
    const sortedMovies = sortMovies(movies, sortSelect.value);

    // Display results
    displayMovies(sortedMovies);

    message.textContent = `${movies.length} movies found`;

  } catch (error) {
    if (currentSearch !== searchId) return;

    console.error("Error fetching movies:", error);

    movies = [];
    moviesGrid.innerHTML = "";

    message.textContent = error.message;
  }
});

// Handle sorting dropdown changes
sortSelect.addEventListener("change", () => {
  const sortedMovies = sortMovies(movies, sortSelect.value);

  displayMovies(sortedMovies);
});

searchMovies("title");