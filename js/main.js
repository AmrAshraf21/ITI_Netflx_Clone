

let allMovies  =[];

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn && window.location.pathname.includes('index.html')) {
        window.location.href = 'login.html';
    }



    // Load movies data
    fetch('http://localhost:3001/movies')
        .then(response => response.json())
        .then(movies => {
          displayMovies(movies, 'featured-slider');
            displayMovies(movies.filter(movie => movie.isPopular).slice(0,16), 'popular-movies');
    displayMovies(movies.filter(movie => movie.isTrending), 'trending-movies');
    displayMovies(movies.slice(0, 8), 'continue-watching');
    
    // Add movies to slider
    
    // Initialize slider functionality
    initMovieSlider();

            // Add click event to movie cards
            document.querySelectorAll('.movie-card').forEach(card => {
                card.addEventListener('click', function() {
                    const movieId = this.getAttribute('data-id');
                    window.location.href = `movie.html?id=${movieId}`;
                });
            });
        })
        .catch(error => console.error('Error loading movies:', error));

    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }

const searchInput = document.getElementById('search-input');
const searchBox = document.querySelector('.search-box');
const searchResults = document.createElement('div');
searchResults.className = 'search-results';
searchBox.appendChild(searchResults);

fetch('http://localhost:3001/movies')
    .then(response => response.json())
    .then(movies => {
        allMovies = movies;
    });


searchInput.addEventListener('input',function(){
    const searchTerm = this.value.trim().toLowerCase();
    
    if (searchTerm.length === 0) {
        searchResults.style.display = 'none';
        return;
    } 
   const filteredMovies = allMovies.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm) ||
        movie.genre.some(g => g.toLowerCase().includes(searchTerm))
    );
    displaySearchResults(filteredMovies);

})

//function to display all result of search
function displaySearchResults(movies) {
    searchResults.innerHTML = '';
    
    if (movies.length === 0) {
        searchResults.innerHTML = '<div class="no-results">No movies found</div>';
    } else {
        movies.forEach(movie => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                <img src="${movie.poster}" alt="${movie.title}">
                <div class="movie-title">${movie.title}</div>
            `;
            resultItem.addEventListener('click', () => {
                window.location.href = `movie.html?id=${movie.id}`;
            });
            searchResults.appendChild(resultItem);
        });
    }
    
    searchResults.style.display = 'block';
}

// Close search results when clicking outside
document.addEventListener('click', function(event) {
    if (!searchBox.contains(event.target)) {
        searchResults.style.display = 'none';
    }
});


    // position of the header and navbar
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
});


//function to load all movies
function displayMovies(movies, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = movies.map(movie => `
        <div class="movie-card" data-id="${movie.id}">
            <img src="${movie.poster}" alt="${movie.title}">
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-year">${movie.year}</div>
            </div>
        </div>
    `).join('');
}



let chatbotOpen = true;

function toggleChatbot() {
    const chatbotContainer = document.getElementById('chatbotContainer');
    const chatbotBody = document.getElementById('chatbotBody');
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    
    chatbotOpen = !chatbotOpen;
    
    if (chatbotOpen) {
        chatbotContainer.classList.remove('collapsed');
        chatbotToggle.textContent = '-';
    } else {
        chatbotContainer.classList.add('collapsed');
        chatbotToggle.textContent = '+';
    }
}

function handleChatbotKeyPress(e) {
    if (e.key === 'Enter') {
        sendChatbotMessage();
    }
}


async function sendChatbotMessage() {
    
 const input = document.getElementById('chatbotInput');
    const message = input.value.trim();
    
    if (message) {
        // Add user message to UI
        addChatbotMessage(message, 'user');
       
        input.value = '';
            try {
            
            const response = await getGeminiResponse(message);
            
            // Add bot response to UI and history
            addChatbotMessage(response, 'bot');
             
           
            
        } catch (error) {
            
            addChatbotMessage("Sorry, I'm having trouble connecting to the AI service. Please try again later.", 'bot');
            console.error("Gemini API error:", error);
        }


    }

}


async function getGeminiResponse(prompt) {
  

  const API_KEY = 'AIzaSyA-1C_6-_yCkiaH0uoNtm3TVJSP3z_PQoY';
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
  
  try {
    const requestBody = {
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }]
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorDetails = await response.json(); // Get full error details
      console.error("API Error Details:", errorDetails);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);
    return "Sorry, I'm having trouble connecting to the AI service.";
  }
}
function addChatbotMessage(text, sender) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const messageElement = document.createElement('div');
    messageElement.className = `chatbot-message ${sender}`;
    messageElement.innerHTML = `<p>${text}</p>`;
    messagesContainer.appendChild(messageElement);
}


//Slider Functionality  |   |||||
function initMovieSlider() {
  const slider = document.querySelector('.slider-container');
  const leftArrow = document.querySelector('.left-arrow');
  const rightArrow = document.querySelector('.right-arrow');
  
  if (!slider || !leftArrow || !rightArrow) return;
  
  // Arrow button functionality
  leftArrow.addEventListener('click', () => {
    slider.scrollBy({
      left: -300,
      behavior: 'smooth'
    });
  });
  
  rightArrow.addEventListener('click', () => {
    slider.scrollBy({
      left: 300,
      behavior: 'smooth'
    });
  });
  
  // Touch/swipe support
  // let isDown = false;
  // let startX;
  // let scrollLeft;
  
  // slider.addEventListener('mousedown', (e) => {
  //   isDown = true;
  //   startX = e.pageX - slider.offsetLeft;
  //   scrollLeft = slider.scrollLeft;
  //   slider.style.cursor = 'grabbing';
  //   slider.style.scrollBehavior = 'auto';
  // });
  
  // slider.addEventListener('mouseleave', () => {
  //   isDown = false;
  //   slider.style.cursor = 'grab';
  //   slider.style.scrollBehavior = 'smooth';
  // });
  
  // slider.addEventListener('mouseup', () => {
  //   isDown = false;
  //   slider.style.cursor = 'grab';
  //   slider.style.scrollBehavior = 'smooth';
  // });
  
  // slider.addEventListener('mousemove', (e) => {
  //   if (!isDown) return;
  //   e.preventDefault();
  //   const x = e.pageX - slider.offsetLeft;
  //   const walk = (x - startX) * 2;
  //   slider.scrollLeft = scrollLeft - walk;
  // });
  
  // Touch events for mobile
  // slider.addEventListener('touchstart', (e) => {
  //   isDown = true;
  //   startX = e.touches[0].pageX - slider.offsetLeft;
  //   scrollLeft = slider.scrollLeft;
  // });
  
  // slider.addEventListener('touchend', () => {
  //   isDown = false;
  // });
  
  // slider.addEventListener('touchmove', (e) => {
  //   if (!isDown) return;
  //   e.preventDefault();
  //   const x = e.touches[0].pageX - slider.offsetLeft;
  //   const walk = (x - startX) * 2;
  //   slider.scrollLeft = scrollLeft - walk;
  // });
}