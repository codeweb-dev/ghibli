const app = document.getElementById("root");
const search = document.getElementById("search");
const logo = document.createElement("img");
const container = document.createElement("div");
const modal = document.createElement("div");

// Set up initial DOM elements
app.appendChild(logo);
app.appendChild(container);
document.body.appendChild(modal); // Add modal to the body

// Fetch movie data
const request = new XMLHttpRequest();
request.open("GET", "https://ghibliapi.vercel.app/films", true);
request.onload = function () {
  const data = JSON.parse(this.responseText);
  if (request.status >= 200 && request.status < 400) {
    container.innerHTML = containerCard(data);
    btnMoreDetails(data); // Call this function after setting innerHTML
    searchContainer(); // Initialize search functionality
  } else {
    console.error("Failed to load data.");
  }
};

// Function to generate movie cards
function containerCard(data) {
  return `
    <div class="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-4">
      ${data
        .map(
          (movie, index) => `
        <div class="bg-white rounded-t-lg shadow-lg hover:shadow-2xl transition-all">
          <div class="px-6 py-4 flex w-full items-center justify-between">
            <div class="flex items-start gap-3">
              <div >
                <p class="text-sm font-black">Director: ${movie.director}</p>
                <p class="text-[11px] text-slate-400">Producer: ${movie.producer}</p>
              </div>
            </div>
            <div>
              <p class="font-black text-[11px]">Rating: ${movie.rt_score}%</p>
            </div>
          </div>
          <div class="overflow-hidden bg-gray-200">
            <img src="${movie.image}" alt="${movie.title}" class="w-full h-64 object-cover">
            <div class="p-6 bg-white rounded-b-lg">
              <h2 class="text-lg font-bold text-gray-800">
                ${movie.title} 
                <span class="mx-2 text-sm text-slate-400">-</span>  
                <span class="text-sm font-normal text-gray-600">${movie.original_title}</span>
              </h2>
              <h3 class="text-sm text-slate-400 mt-1">${movie.original_title_romanised}</h3>
              <div class="mt-4">
                <p class="text-gray-700 text-sm leading-snug line-clamp-4">${movie.description}</p>
              </div>
              <div class="flex items-center justify-end w-full">
                <button data-index="${index}" class="open-modal-btn text-sm bg-black py-2 px-4 rounded-full text-white border hover:text-black hover:bg-white transition-all hover:border hover:border-black mt-6">See more details.</button>
              </div>
            </div>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

function getProgressBarColor(score) {
  if (score <= 30 && score >= 0) return "text-red-500"; // Red for scores below 20%
  if (score <= 50 && score <= 80) return "text-yellow-500"; // Yellow for scores between 20% and 50%
  return "text-green-500"; // Green for scores above 50%
}

// Function to fetch people data
async function fetchPeopleData(peopleUrls) {
  try {
    const peoplePromises = peopleUrls.map((url) =>
      fetch(url).then((response) => response.json())
    );
    const peopleData = await Promise.all(peoplePromises);

    console.log(peopleData);
    return peopleData;
  } catch (error) {
    console.error("Error fetching people data:", error);
    return [];
  }
}

// Function to generate modal details
function modalDetailsCard(movie, peopleData) {
  return `
    <div class="bg-white p-6 rounded-lg w-11/12 max-w-lg max-h-[90vh] overflow-y-auto relative scroll-modal">
      <button id="close-modal" class="absolute top-3 right-4 text-gray-600 hover:text-gray-800 transition-colors">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <h2 class="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
        ${movie.title}
      </h2>
      <img src="${
        movie.movie_banner
      }" alt="banner_image" class="mb-4 rounded-lg">
      <p class="text-gray-800 mb-4">${movie.description}</p>
      <p class="text-sm text-gray-600 mb-2">Director: ${movie.director}</p>
      <p class="text-sm text-gray-600 mb-2">Producer: ${movie.producer}</p>
      <p class="text-sm text-gray-600 mb-2">Rating: ${movie.rt_score}%</p>
      <p class="text-sm text-gray-600 mb-2">Release Date: ${
        movie.release_date
      }</p>
      <p class="text-sm text-gray-600 mb-4">Running Time: ${formatRunningTime(
        movie.running_time
      )}</p>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">People:</h3>
      <ul class="space-y-4">
        ${peopleData
          .map(
            (person) => `
          <li class="flex flex-col bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
            <p class="font-medium text-gray-900">${person.name || "Unknown"}</p>
            <p class="text-sm text-gray-600">Gender: ${
              person.gender || "Not specified"
            }</p>
            <p class="text-sm text-gray-600">Age: ${
              person.age || "Not specified"
            }</p>
          </li>
        `
          )
          .join("")}
      </ul>
    </div>
  `;
}

// Helper function to convert minutes into hours and minutes
function formatRunningTime(minutes) {
  if (!minutes) return "Not specified";

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  let timeString = "";
  if (hrs > 0) {
    timeString += `${hrs}hr `;
  }

  if (mins > 0) {
    timeString += `${mins}mins`;
  }

  return timeString.trim() || "Not specified";
}

// Function to handle "See more details" buttons
async function btnMoreDetails(data) {
  const buttons = document.querySelectorAll(".open-modal-btn");
  const modal = document.getElementById("movie-modal");

  buttons.forEach((button) => {
    button.addEventListener("click", async function () {
      const index = this.getAttribute("data-index");
      const movieIndex = parseInt(index, 10);
      const movie = data[movieIndex];

      if (movie) {
        // Fetch people data for the movie
        const peopleData = await fetchPeopleData(movie.people);

        // Generate and set modal content
        modal.innerHTML = modalDetailsCard(movie, peopleData);

        // Display the modal
        modal.classList.remove("hidden");

        // Set up close modal functionality
        const closeModalButton = document.getElementById("close-modal");
        closeModalButton.addEventListener("click", () => {
          modal.classList.add("hidden");
        });

        // Optionally, close the modal if clicking outside of it
        modal.addEventListener("click", (event) => {
          if (event.target === modal) {
            modal.classList.add("hidden");
          }
        });
      } else {
        console.error("No movie found at index " + index);
      }
    });
  });
}

// Function to filter and display movies based on search input
function searchContainer() {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const clearInput = document.getElementById("clearInput");

  // Show the text in the console as you type
  searchInput.addEventListener("input", () => {
    searchInput.value.length != 0
      ? clearInput.classList.remove("hidden")
      : clearInput.classList.add("hidden");
  });

  clearInput.addEventListener("click", () => {
    const query = (searchInput.value = "");
    searchInput.value = "";
    clearInput.classList.add("hidden");
    filterMovies(query);
  });

  searchBtn.addEventListener("click", () => {
    const query = searchInput.value.toLowerCase();
    filterMovies(query);
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.toLowerCase();
      filterMovies(query);
    }
  });
}

function filterMovies(query) {
  const movieCards = document.querySelectorAll(".bg-white");
  const noResultsMessage = document.getElementById("no-results");
  noResultsMessage.textContent = `${query} not found.`;
  let hasResults = false;
  let visibleCount = 0; // Counter for visible cards

  movieCards.forEach((card) => {
    const title = card.querySelector("h2").textContent.toLowerCase();
    const description = card.querySelector("p").textContent.toLowerCase();
    if (title.includes(query) || description.includes(query)) {
      card.style.display = "block";
      console.log(`Visible card: ${title}`); // Log each matching card title
      hasResults = true;
      visibleCount++; // Increment the counter for each visible card
    } else {
      card.style.display = "none";
    }
  });

  noResultsMessage.style.display = hasResults ? "none" : "block";
  console.log(
    `Found ${visibleCount} cards matching the search query: "${query}"`
  );
}

request.send();
