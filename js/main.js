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
            displayMovies(movies.filter(movie => movie.isPopular), 'popular-movies');
            displayMovies(movies.filter(movie => movie.isTrending), 'trending-movies');
            displayMovies(movies, 'continue-watching');
            
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

    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
});

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