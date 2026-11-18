// Custodia filter data
// Times are approximate (minutes:seconds from start) based on publicly available content guides.
// This is a demo — real filters would be frame-accurate and created by careful human review.

const CUSTODIA_MOVIES = [
  {
    id: "sound-of-music",
    title: "The Sound of Music",
    year: 1965,
    runtime: 174, // minutes
    runtimeSeconds: 174 * 60,
    rating: "A-I",
    genres: ["Musical", "Drama", "Family"],
    posterColor: "#2c5282",
    summary: "Joyful classic. Extremely mild overall.",
    categories: {
      language: { label: "Language & Blasphemy", defaultOn: false },
      violence: { label: "Violence / Intense Moments", defaultOn: true },
      sexual: { label: "Romantic / Sexual Content", defaultOn: false },
      substance: { label: "Substance Use", defaultOn: false },
      other: { label: "Other Concerns", defaultOn: false }
    },
    segments: [
      {
        id: "som-kiss-1",
        start: 70 * 60,      // ~1:10
        end: 71 * 60 + 15,
        category: "sexual",
        action: "skip",
        label: "Brief kiss (Liesl & Rolfe)"
      },
      {
        id: "som-kiss-2",
        start: 130 * 60,     // ~2:10
        end: 131 * 60 + 20,
        category: "sexual",
        action: "skip",
        label: "Captain & Maria kiss"
      },
      {
        id: "som-nazi",
        start: 155 * 60,     // final ~20 min
        end: 172 * 60,
        category: "violence",
        action: "none",      // mostly thematic; user can choose to keep awareness
        label: "Nazi presence & escape (mild tension)"
      },
      {
        id: "som-smoking",
        start: 45 * 60,
        end: 48 * 60,
        category: "substance",
        action: "mute",
        label: "Baroness smoking / social drinking"
      }
    ]
  },
  {
    id: "prince-of-egypt",
    title: "The Prince of Egypt",
    year: 1998,
    runtime: 99,
    runtimeSeconds: 99 * 60,
    rating: "A-II",
    genres: ["Animated", "Biblical", "Drama"],
    posterColor: "#744210",
    summary: "Powerful Exodus story. Some intense biblical sequences.",
    categories: {
      language: { label: "Language & Blasphemy", defaultOn: false },
      violence: { label: "Violence / Intense Moments", defaultOn: true },
      sexual: { label: "Romantic / Sexual Content", defaultOn: false },
      substance: { label: "Substance Use", defaultOn: false },
      other: { label: "Other Concerns (plagues, death of firstborn)", defaultOn: true }
    },
    segments: [
      {
        id: "poe-infants",
        start: 0,
        end: 4 * 60,
        category: "violence",
        action: "skip",
        label: "Opening: seizure of Hebrew infants (mostly implied)"
      },
      {
        id: "poe-overseer",
        start: 24 * 60,
        end: 26 * 60 + 30,
        category: "violence",
        action: "skip",
        label: "Moses causes overseer's death"
      },
      {
        id: "poe-plagues",
        start: 55 * 60,
        end: 68 * 60,
        category: "other",
        action: "skip",
        label: "The Plagues sequence (intense)"
      },
      {
        id: "poe-firstborn",
        start: 72 * 60,
        end: 78 * 60,
        category: "other",
        action: "skip",
        label: "Angel of Death / death of the firstborn"
      },
      {
        id: "poe-redsea",
        start: 85 * 60,
        end: 92 * 60,
        category: "violence",
        action: "none",
        label: "Parting of the Red Sea & army (dramatic, not gory)"
      },
      {
        id: "poe-kiss",
        start: 40 * 60,
        end: 41 * 60,
        category: "sexual",
        action: "skip",
        label: "Brief romantic moment (Moses & Tzipporah)"
      }
    ]
  }
];
