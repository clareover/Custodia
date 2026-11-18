// Custodia — Player + Filter controls

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('player-root');
  if (!root || typeof CUSTODIA_MOVIES === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const movieId = params.get('id');
  const movie = CUSTODIA_MOVIES.find(m => m.id === movieId);

  if (!movie) {
    root.innerHTML = `<p class="loading">Movie not found. <a href="index.html">Back to library</a></p>`;
    return;
  }

  // State
  const filterState = {};
  Object.keys(movie.categories).forEach(key => {
    filterState[key] = movie.categories[key].defaultOn;
  });

  let currentTime = 0; // seconds
  let isPlaying = false;
  let ccOn = false;
  let animId = null;
  const SPEED = 8; // demo speed multiplier (real-time would be 1)

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function activeSegments() {
    return movie.segments.filter(seg => {
      return filterState[seg.category] && seg.action !== 'none';
    });
  }

  function getActionAt(time) {
    for (const seg of activeSegments()) {
      if (time >= seg.start && time < seg.end) {
        return seg;
      }
    }
    return null;
  }

  function render() {
    const total = movie.runtimeSeconds;
    const pct = Math.min(100, (currentTime / total) * 100);
    const action = getActionAt(currentTime);
    const segs = activeSegments();

    // Timeline markers
    const markers = movie.segments.map(seg => {
      if (!filterState[seg.category] || seg.action === 'none') return '';
      const left = (seg.start / total) * 100;
      const width = ((seg.end - seg.start) / total) * 100;
      return `<div class="timeline-segment ${seg.action}" style="left:${left}%;width:${width}%" title="${seg.label}"></div>`;
    }).join('');

    // Filter toggles
    const toggles = Object.entries(movie.categories).map(([key, cat]) => {
      const checked = filterState[key] ? 'checked' : '';
      return `
        <div class="filter-row">
          <label for="f-${key}">${cat.label}</label>
          <div class="toggle">
            <input type="checkbox" id="f-${key}" data-cat="${key}" ${checked}>
            <span class="toggle-slider"></span>
          </div>
        </div>
      `;
    }).join('');

    // Segment list
    const segList = movie.segments.map(seg => {
      const enabled = filterState[seg.category] && seg.action !== 'none';
      return `
        <div class="segment-item ${enabled ? '' : 'disabled'}">
          <span class="segment-time">${formatTime(seg.start)} – ${formatTime(seg.end)}</span>
          <span>${seg.label} <em>(${seg.action})</em></span>
        </div>
      `;
    }).join('');

    const statusText = action
      ? (action.action === 'skip' ? 'Skipping…' : 'Muted')
      : (isPlaying ? 'Playing (demo)' : 'Paused');

    root.innerHTML = `
      <div class="player-header">
        <h1>${movie.title}</h1>
        <p class="meta">${movie.year} · ${movie.runtime} min · Guide rating ${movie.rating}</p>
      </div>

      <div class="filter-panel">
        <h2>
          Filter Settings
          <span style="font-size:0.8rem;font-weight:400;color:var(--muted)">Toggle what to skip or mute</span>
        </h2>
        <div class="filter-list" id="filter-list">
          ${toggles}
        </div>
      </div>

      <div class="demo-player">
        <div class="screen" id="screen">
          <div class="screen-title">${movie.title}</div>
          <div class="screen-status" id="status">${statusText}</div>
          <p style="font-size:0.85rem;opacity:0.6;max-width:320px">
            Demo simulation — no actual movie file is loaded.<br>
            Timeline advances and jumps over filtered segments.
          </p>
          <div class="screen-overlay ${action ? 'visible ' + action.action : ''}" id="overlay">
            <span>${action ? (action.action === 'skip' ? '⏭ Skipped' : '🔇 Muted') : ''}</span>
            <span style="font-size:0.85rem;font-weight:400;opacity:0.9">${action ? action.label : ''}</span>
          </div>
        </div>
        <div class="controls">
          <div class="timeline-wrap">
            <div class="timeline" id="timeline">
              ${markers}
              <div class="timeline-progress" id="progress" style="width:${pct}%"></div>
            </div>
            <div class="time-row">
              <span id="time-current">${formatTime(currentTime)}</span>
              <span>${formatTime(total)}</span>
            </div>
          </div>
          <div class="btn-row">
            <button class="btn-play" id="btn-play" aria-label="Play or pause">${isPlaying ? '❚❚' : '▶'}</button>
            <button class="btn btn-secondary" id="btn-reset" style="color:#fff;border-color:rgba(255,255,255,0.4)">Reset</button>
            <label class="cc-toggle">
              <input type="checkbox" id="cc-toggle" ${ccOn ? 'checked' : ''}>
              Closed Captions (demo)
            </label>
          </div>
        </div>
      </div>

      <div class="active-summary">
        <strong>${segs.length}</strong> active filter segment${segs.length !== 1 ? 's' : ''} will be skipped or muted.
      </div>

      <div class="segment-list">
        <h3>All known segments for this title</h3>
        ${segList}
      </div>

      <p class="legal-note">
        <strong>Important:</strong> This is a demonstration of how Custodia filters would work.
        Custodia does not host, stream, or modify movie files. In a full version it would control
        playback of <em>your</em> authorized copy (streaming service or disc) only, in accordance
        with the Family Movie Act. Closed captions are optional and can be turned on or off.
      </p>
    `;

    // Re-bind events after render
    bindEvents();
  }

  function bindEvents() {
    // Toggles
    document.querySelectorAll('#filter-list input[type="checkbox"]').forEach(input => {
      input.addEventListener('change', () => {
        filterState[input.dataset.cat] = input.checked;
        // If we are inside a now-disabled segment, just continue
        render();
      });
    });

    // Play / Pause
    const btnPlay = document.getElementById('btn-play');
    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        isPlaying = !isPlaying;
        if (isPlaying) tick();
        else cancelAnimationFrame(animId);
        render();
      });
    }

    // Reset
    const btnReset = document.getElementById('btn-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        isPlaying = false;
        currentTime = 0;
        cancelAnimationFrame(animId);
        render();
      });
    }

    // CC
    const cc = document.getElementById('cc-toggle');
    if (cc) {
      cc.addEventListener('change', () => {
        ccOn = cc.checked;
      });
    }

    // Timeline click to seek
    const timeline = document.getElementById('timeline');
    if (timeline) {
      timeline.addEventListener('click', (e) => {
        const rect = timeline.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        currentTime = Math.max(0, Math.min(movie.runtimeSeconds, ratio * movie.runtimeSeconds));
        render();
      });
    }
  }

  function tick() {
    if (!isPlaying) return;

    const action = getActionAt(currentTime);
    if (action && action.action === 'skip') {
      // Jump to end of segment
      currentTime = action.end;
    } else {
      currentTime += SPEED; // demo speed
    }

    if (currentTime >= movie.runtimeSeconds) {
      currentTime = movie.runtimeSeconds;
      isPlaying = false;
      render();
      return;
    }

    render();
    animId = requestAnimationFrame(tick);
  }

  // Initial draw
  render();
});
