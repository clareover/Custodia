// Catholic Movie Guide — search & filter interactivity

document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.main-nav');

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const isOpen = nav.style.display === 'flex';
      nav.style.display = isOpen ? 'none' : 'flex';
      nav.style.flexDirection = 'column';
      nav.style.position = 'absolute';
      nav.style.top = '64px';
      nav.style.left = '0';
      nav.style.right = '0';
      nav.style.background = '#fff';
      nav.style.padding = '1rem';
      nav.style.borderBottom = '1px solid #e2e8f0';
      nav.style.gap = '0.75rem';
      nav.style.zIndex = '99';
    });
  }

  // ===== Filtering logic =====
  function filterMovies() {
    const cards = document.querySelectorAll('.movie-card');
    if (!cards.length) return;

    // Get current filter values (works on both home and browse)
    const homeSearch = document.getElementById('search-input');
    const browseSearch = document.getElementById('browse-search');
    const ratingSelect = document.getElementById('filter-rating');
    const genreSelect = document.getElementById('filter-genre');

    const query = (
      (homeSearch && homeSearch.value) ||
      (browseSearch && browseSearch.value) ||
      ''
    ).trim().toLowerCase();

    const ratingFilter = ratingSelect ? ratingSelect.value : '';
    const genreFilter = genreSelect ? genreSelect.value.toLowerCase() : '';

    cards.forEach(card => {
      const title = (card.dataset.title || '').toLowerCase();
      const rating = card.dataset.rating || '';
      const genres = (card.dataset.genres || '').toLowerCase();

      const matchesSearch = !query || title.includes(query);
      const matchesRating = !ratingFilter || rating === ratingFilter;
      const matchesGenre = !genreFilter || genres.includes(genreFilter);

      if (matchesSearch && matchesRating && matchesGenre) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  // Home page search
  const homeSearchInput = document.getElementById('search-input');
  const homeSearchBtn = document.querySelector('.search-btn');

  if (homeSearchInput) {
    homeSearchInput.addEventListener('input', filterMovies);
    homeSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        filterMovies();
      }
    });
  }

  if (homeSearchBtn) {
    homeSearchBtn.addEventListener('click', () => {
      filterMovies();
    });
  }

  // Browse page search + filters
  const browseSearchInput = document.getElementById('browse-search');
  const ratingSelect = document.getElementById('filter-rating');
  const genreSelect = document.getElementById('filter-genre');

  if (browseSearchInput) {
    browseSearchInput.addEventListener('input', filterMovies);
  }
  if (ratingSelect) {
    ratingSelect.addEventListener('change', filterMovies);
  }
  if (genreSelect) {
    genreSelect.addEventListener('change', filterMovies);
  }
});
