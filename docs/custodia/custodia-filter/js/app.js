// Custodia — Library page

document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('movie-list');
  if (!list || typeof CUSTODIA_MOVIES === 'undefined') return;

  list.innerHTML = CUSTODIA_MOVIES.map(movie => {
    const ratingClass = 'rating-' + movie.rating.toLowerCase().replace('-', '');
    return `
      <article class="movie-item">
        <div class="movie-poster" style="background: ${movie.posterColor}">
          ${movie.title}
        </div>
        <div class="movie-body">
          <h3>${movie.title}</h3>
          <p class="movie-meta">${movie.year} · ${movie.runtime} min · ${movie.genres.join(' / ')}</p>
          <span class="rating-pill ${ratingClass}">${movie.rating}</span>
          <p class="movie-summary">${movie.summary}</p>
          <a class="btn btn-primary" href="player.html?id=${movie.id}">Open Filters &amp; Player</a>
        </div>
      </article>
    `;
  }).join('');
});
