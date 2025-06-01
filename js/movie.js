

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }

    // Get movie ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    //window.location.search ==> ?id=1
    
    const movieId = urlParams.get('id');

    if (!movieId) {
        window.location.href = 'index.html';
        return;
    }

    // Load movie details
    fetch(`https://awesome-deeply-mouth.glitch.me/movies/${movieId}`)
        .then(response => response.json())
        .then(movie => {
            displayMovieDetails(movie);
            loadReviews(movieId);
        })
        .catch(error => {
            console.error('Error loading movie:', error);
            window.location.href = 'index.html';
        });

    // Star rating functionality
    const stars = document.querySelectorAll('.stars i');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating')); // 3
            document.getElementById('rating-value').value = rating;
            
            stars.forEach((s, index) => {
                
                
                if (index < rating) {
                    s.classList.remove('far');
                    s.classList.add('fas', 'active');
                } else {
                    s.classList.remove('fas', 'active');
                    s.classList.add('far');
                }
            });
        });
    });

    // Review form submission
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const rating = document.getElementById('rating-value').value;
            const text = document.getElementById('review-text').value;
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            
            if (!rating || rating === '0') {
                alert('Please select a rating');
                return;
            }
            
            if (!text.trim()) {
                alert('Please write your review');
                return;
            }
             
            fetch(`https://awesome-deeply-mouth.glitch.me/reviews`).then(res=>{
                return res.json();
            }).then(result=>{
               const lastId = Math.max(...result.map(x=>parseInt(x.id)))+1;
             
            const newReview = {
                id:lastId.toString(),
                movieId: parseInt(movieId),
                userId:parseInt( currentUser.id),
                userName: currentUser.name,
                rating: parseInt(rating),
                text: text.trim(),
                date: new Date().toISOString()
            };
            
                return newReview;                
            }).then(newReview=>{
              fetch('https://awesome-deeply-mouth.glitch.me/reviews',{
               method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newReview)
                }).then(response => response.json())
                  .then(() => {
                // Reset form
                reviewForm.reset();
                stars.forEach(star => {
                    star.classList.remove('fas', 'active');
                    star.classList.add('far');
                });
                document.getElementById('rating-value').value = '0';
                
                // Reload reviews
                loadReviews(movieId);
            })
            .catch(error => console.error('Error submitting review:', error));
            })
           
        });
    }
});


function displayMovieDetails(movie) {
    const movieDetailsContainer = document.getElementById('movie-details');
    
    movieDetailsContainer.style.backgroundImage = `url('${movie.backdrop}')`;
    
    movieDetailsContainer.innerHTML = `
        <div class="movie-details-content">
            <img src="${movie.poster}" alt="${movie.title}" class="movie-poster">
            <h1 class="movie-title">${movie.title}</h1>
            <div class="movie-meta">
                <span>${movie.year}</span>
                <span>${movie.runtime}</span>
                <span><i class="fas fa-star"></i> ${movie.rating}</span>
                <span>${movie.genre.join('   |  ')}</span>
            </div>
            <p class="movie-overview">${movie.overview}</p>
            <div class="movie-actions">
                <button class="play-button"><i class="fas fa-play"></i> Play</button>
                <button class="add-to-list"><i class="fas fa-plus"></i> My List</button>
            </div>
        </div>
    `;
}

function loadReviews(movieId) {
    fetch('https://awesome-deeply-mouth.glitch.me/reviews')
        .then(response => response.json())
        .then(reviews => {
            const movieReviews = reviews.filter(review => review.movieId === parseInt(movieId));
            displayReviews(movieReviews);
        })
        .catch(error => console.error('Error loading reviews:', error));
}



function setupReviewActions() {
    // Edit review buttons
    
    
    document.querySelectorAll('.edit-review-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // const reviewId = parseInt(this.getAttribute('data-review-id'));
            const reviewId = this.getAttribute('data-review-id');
            
            
            editReview(reviewId);
        });
    });

    // Delete review buttons
    document.querySelectorAll('.delete-review-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // const reviewId = parseInt(this.getAttribute('data-review-id'));
            const reviewId = this.getAttribute('data-review-id');
            if (confirm('Are you sure you want to delete this review?')) {
                deleteReview(reviewId);
            }
        });
    });
}

function editReview(reviewId) {
    fetch(`https://awesome-deeply-mouth.glitch.me/reviews/${reviewId}`)
        .then(response => response.json())
        .then(review => {
            // Create edit form
            const editForm = document.createElement('div');
            editForm.className = 'edit-review-form';
            editForm.innerHTML = `
                <h4>Edit Review</h4>
                <form id="edit-review-form-${reviewId}">
                    <div class="rating-input">
                        <label>Rating:</label>
                        <div class="stars">
                            ${[1, 2, 3, 4, 5].map(i => `
                                <i class="${i <= review.rating ? 'fas' : 'far'} fa-star ${i <= review.rating ? 'active' : ''}" 
                                   data-rating="${i}"></i>
                            `).join('')}
                        </div>
                        <input type="hidden" id="edit-rating-value-${reviewId}" name="rating" value="${review.rating}">
                    </div>
                    <div class="form-group">
                        <textarea id="edit-review-text-${reviewId}" required>${review.text}</textarea>
                    </div>
                    <button type="submit" class="submit-review-btn">Update Review</button>
                    <button type="button" class="cancel-edit-btn">Cancel</button>
                </form>
            `;

            // Find the review card and append the edit form
            const reviewCard = document.querySelector(`.review-card [data-review-id="${reviewId}"]`).closest('.review-card');
            reviewCard.appendChild(editForm);

            // Set up star rating for edit form
            const stars = editForm.querySelectorAll('.stars i');
            stars.forEach(star => {
                star.addEventListener('click', function() {
                    const rating = parseInt(this.getAttribute('data-rating'));
                    document.getElementById(`edit-rating-value-${reviewId}`).value = rating;
                    
                    stars.forEach((s, index) => {
                        if (index < rating) {
                            s.classList.remove('far');
                            s.classList.add('fas', 'active');
                        } else {
                            s.classList.remove('fas', 'active');
                            s.classList.add('far');
                        }
                    });
                });
            });

            // Handle form submission
            const form = document.getElementById(`edit-review-form-${reviewId}`);
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                updateReview(reviewId);
            });

            // Handle cancel button
            editForm.querySelector('.cancel-edit-btn').addEventListener('click', function() {
                editForm.remove();
            });
        })
        .catch(error => console.error('Error loading review:', error));
}

function updateReview(reviewId) {
    const rating = document.getElementById(`edit-rating-value-${reviewId}`).value;
    const text = document.getElementById(`edit-review-text-${reviewId}`).value;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!rating || rating === '0') {
        alert('Please select a rating');
        return;
    }

    if (!text.trim()) {
        alert('Please write your review');
        return;
    }

    fetch(`https://awesome-deeply-mouth.glitch.me/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            rating: parseInt(rating),
            text: text.trim(),
            date: new Date().toISOString()
        })
    })
    .then(response => response.json())
    .then(() => {
        // Reload reviews
        const movieId = new URLSearchParams(window.location.search).get('id');
        loadReviews(movieId);
    })
    .catch(error => console.error('Error updating review:', error));
}

function deleteReview(reviewId) {
    fetch(`https://awesome-deeply-mouth.glitch.me/reviews/${reviewId}`, {
        method: 'DELETE'
    })
    .then(() => {
        // Reload reviews
        const movieId = new URLSearchParams(window.location.search).get('id');
        loadReviews(movieId);
    })
    .catch(error => console.error('Error deleting review:', error));
}

function displayReviews(reviews) {
    const reviewsContainer = document.getElementById('reviews-container');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (reviews.length === 0) {
        reviewsContainer.innerHTML = '<p>No reviews yet. Be the first to review!</p>';
        return;
    }
    
    reviewsContainer.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <div>
                    <span class="review-author">${review.userName}</span>
                    <span class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
                </div>
                <span class="review-date">${new Date(review.date).toLocaleDateString()}</span>
            </div>
            <p class="review-text">${review.text}</p>
            ${currentUser && currentUser.id == review.userId ? `
                <div class="review-actions">
                    <button class="edit-review-btn" data-review-id="${review.id}">Edit</button>
                    <button class="delete-review-btn" data-review-id="${review.id}">Delete</button>
                </div>
            ` : ''}
        </div>
    `).join('');

    // Set up event listeners for edit/delete buttons
    setupReviewActions();
}

