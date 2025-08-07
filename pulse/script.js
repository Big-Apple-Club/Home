/*
 * BAC Pulse client‑side logic
 *
 * This script loads event data from a JSON file, renders a week and day
 * selector, lists events for the selected day, highlights the top three
 * events based on user votes and implements a simple per‑event voting
 * mechanism with a two minute cooldown using localStorage.
 */

(() => {
  // Element references
  const weekRangeEl = document.getElementById('week-range');
  const daySelectorEl = document.getElementById('day-selector');
  const eventListEl = document.getElementById('event-list');
  const hotThreeEl = document.getElementById('hot-three-list');
  const prevWeekBtn = document.getElementById('prev-week');
  const nextWeekBtn = document.getElementById('next-week');
  const todayBtn = document.getElementById('today-btn');
  const locationListEl = document.getElementById('location-list');
  
  // The list of events.  
  // NOTE: This array is generated from events.json to avoid fetch issues when
  // the site is opened from the file system.  When hosting this project on a
  // web server you can remove this array and rely on fetching events.json.
  const EVENTS_DATA = [
    {"name": "Hawā Open Air", "genre": "Festival/Electro", "location": "Frankfurt Airport", "latitude": 50.0379, "longitude": 8.5622, "date": "2025-07-20", "time": "14:00", "url": "https://hawa.ticket.io/"},
    {"name": "Club House", "genre": "House", "location": "Chinaski", "latitude": 50.117, "longitude": 8.6675, "date": "2025-08-01", "time": "22:00", "url": "https://chinaskiclub.de/"},
    {"name": "ZirKuss", "genre": "Circus/Club", "location": "Pik Dame", "latitude": 50.1039, "longitude": 8.6649, "date": "2025-08-01", "time": "23:00", "url": "https://www.pikdamefrankfurt.com"},
    {"name": "Signature House", "genre": "House", "location": "Chinaski", "latitude": 50.117, "longitude": 8.6675, "date": "2025-08-02", "time": "23:00", "url": "https://chinaskiclub.de/"},
    {"name": "Pik Dame Hip-Hop", "genre": "Hip Hop", "location": "Pik Dame", "latitude": 50.1039, "longitude": 8.6649, "date": "2025-08-02", "time": "23:00", "url": "https://www.pikdamefrankfurt.com"},
    {"name": "Out of Office (OOO)", "genre": "House", "location": "Chinaski", "latitude": 50.117, "longitude": 8.6675, "date": "2025-08-06", "time": "18:00", "url": "https://chinaskiclub.de/"},
    {"name": "Karaoke Night", "genre": "Karaoke", "location": "Pik Dame", "latitude": 50.1039, "longitude": 8.6649, "date": "2025-08-07", "time": "21:00", "url": "https://www.pikdamefrankfurt.com"},
    {"name": "Zino’s Hum Mod", "genre": "House", "location": "Fortuna Irgendwo", "latitude": 50.1106, "longitude": 8.7167, "date": "2025-08-07", "time": "16:00", "url": "https://nightlyfe.de/events/47187"},
    {"name": "Ballroom Code Queer Summer Garden", "genre": "Pop", "location": "Fortuna Irgendwo", "latitude": 50.1106, "longitude": 8.7167, "date": "2025-08-08", "time": "18:00", "url": "https://nightlyfe.de/events/47186"},
    {"name": "Boujee", "genre": "Hip Hop/R&B", "location": "Gibson Club", "latitude": 50.1162, "longitude": 8.6833, "date": "2025-08-08", "time": "23:00", "url": "https://gibson-club.de/"},
    {"name": "THW Sommerfest x Sachsentrance Takeover", "genre": "Techno", "location": "Tanzhaus West", "latitude": 50.098, "longitude": 8.6464, "date": "2025-08-09", "time": "16:00", "url": "https://nightlyfe.de/events/44809"},
    {"name": "Sunday Service", "genre": "House", "location": "Silbergold", "latitude": 50.1144, "longitude": 8.6921, "date": "2025-08-09", "time": "23:59", "url": "https://silbergold-club.de/"},
    {"name": "Karaoke Night", "genre": "Karaoke", "location": "Pik Dame", "latitude": 50.1039, "longitude": 8.6649, "date": "2025-08-09", "time": "21:00", "url": "https://www.pikdamefrankfurt.com"},
    {"name": "Hawā Open Air", "genre": "Festival/Electro", "location": "Frankfurt Airport", "latitude": 50.0379, "longitude": 8.5622, "date": "2025-07-20", "time": "14:00", "url": "https://hawa.ticket.io/"},
    {"name": "AfterWork Clubbing", "genre": "House/Charts", "location": "Gibson Club", "latitude": 50.1162, "longitude": 8.6833, "date": "2025-08-10", "time": "22:00", "url": "https://gibson-club.de/"},
    {"name": "Gibby Haynes performing Butthole Surfers", "genre": "Rock", "location": "ZOOM Frankfurt", "latitude": 50.116, "longitude": 8.7058, "date": "2025-08-11", "time": "19:00", "url": "https://nightlyfe.de/events/47683"},
    {"name": "AfterWork Clubbing", "genre": "House/Charts", "location": "Gibson Club", "latitude": 50.1162, "longitude": 8.6833, "date": "2025-08-11", "time": "22:00", "url": "https://gibson-club.de/"},
    {"name": "Wild at Heart", "genre": "Rock/Pop", "location": "Chinaski", "latitude": 50.117, "longitude": 8.6675, "date": "2025-08-12", "time": "22:00", "url": "https://chinaskiclub.de/"},
    {"name": "Holocube DJ Hologramm Show", "genre": "Electronic", "location": "Batschkapp", "latitude": 50.1309, "longitude": 8.7602, "date": "2025-08-09", "time": "22:00", "url": "https://batschkapp.net/batschkapp"},
    {"name": "Out of Office (OOO)", "genre": "House", "location": "Chinaski", "latitude": 50.117, "longitude": 8.6675, "date": "2025-08-13", "time": "18:00", "url": "https://chinaskiclub.de/"},
    {"name": "Trivium", "genre": "Metal", "location": "Batschkapp", "latitude": 50.1309, "longitude": 8.7602, "date": "2025-08-10", "time": "20:00", "url": "https://batschkapp.net/batschkapp"},
    {"name": "AfterWork Clubbing", "genre": "House/Charts", "location": "Gibson Club", "latitude": 50.1162, "longitude": 8.6833, "date": "2025-08-13", "time": "22:00", "url": "https://gibson-club.de/"},
    {"name": "Hilltop Hoods", "genre": "Hip Hop", "location": "ZOOM Frankfurt", "latitude": 50.116, "longitude": 8.7058, "date": "2025-08-13", "time": "20:00", "url": "https://zoomfrankfurt.com/programm"},
    {"name": "Out of Office (OOO)", "genre": "House", "location": "Chinaski", "latitude": 50.117, "longitude": 8.6675, "date": "2025-08-14", "time": "18:00", "url": "https://chinaskiclub.de/"},
    {"name": "Mastodon", "genre": "Metal", "location": "Batschkapp", "latitude": 50.1309, "longitude": 8.7602, "date": "2025-08-13", "time": "20:00", "url": "https://batschkapp.net/batschkapp"},
    {"name": "Hilltop Hoods", "genre": "Hip Hop", "location": "ZOOM Frankfurt", "latitude": 50.116, "longitude": 8.7058, "date": "2025-08-14", "time": "20:00", "url": "https://zoomfrankfurt.com/programm"},
    {"name": "AfterWork Clubbing", "genre": "House/Charts", "location": "Gibson Club", "latitude": 50.1162, "longitude": 8.6833, "date": "2025-08-14", "time": "22:00", "url": "https://gibson-club.de/"},
    {"name": "Wild at Heart", "genre": "Rock/Pop", "location": "Chinaski", "latitude": 50.117, "longitude": 8.6675, "date": "2025-08-14", "time": "22:00", "url": "https://chinaskiclub.de/"},
    {"name": "Zino’s Hum Mod", "genre": "House", "location": "Fortuna Irgendwo", "latitude": 50.1106, "longitude": 8.7167, "date": "2025-08-14", "time": "16:00", "url": "https://nightlyfe.de/events/47187"},
    {"name": "Rooftop Affairs", "genre": "House", "location": "Chicago Roof (Gekko House)", "latitude": 50.1114, "longitude": 8.6606, "date": "2025-08-15", "time": "17:00", "url": "https://affairsffm.ticket.io/"},
    {"name": "Yacht Affairs Semester Closing", "genre": "House", "location": "Freigut Frankfurt", "latitude": 50.1059, "longitude": 8.6818, "date": "2025-08-08", "time": "17:00", "url": "https://affairsffm.ticket.io/"},
    {"name": "Boujee", "genre": "Hip Hop/R&B", "location": "Gibson Club", "latitude": 50.1162, "longitude": 8.6833, "date": "2025-08-15", "time": "23:00", "url": "https://gibson-club.de/"},
    {"name": "Wild at Heart", "genre": "Rock/Pop", "location": "Chinaski", "latitude": 50.117, "longitude": 8.6675, "date": "2025-08-15", "time": "22:00", "url": "https://chinaskiclub.de/"},
    {"name": "Official KEvents: KPOP & KHIPHOP Night", "genre": "K-Pop/Hip-Hop", "location": "MTW Club", "latitude": 50.0975, "longitude": 8.7344, "date": "2025-08-15", "time": "22:00", "url": "https://www.mtwclub.de/officialkevents-frankfurt-kpop-khiphop-night-in-august/"},
    {"name": "Out of Office (OOO)", "genre": "House", "location": "Chinaski", "latitude": 50.117, "longitude": 8.6675, "date": "2025-08-20", "time": "18:00", "url": "https://chinaskiclub.de/"},
    {"name": "HumMod – Golden Hour", "genre": "House", "location": "Fortuna Irgendwo", "latitude": 50.1106, "longitude": 8.7167, "date": "2025-08-20", "time": "19:00", "url": "https://fortunairgendwo.ticket.io/"},
    {"name": "Hilltop Hoods", "genre": "Hip Hop", "location": "ZOOM Frankfurt", "latitude": 50.116, "longitude": 8.7058, "date": "2025-08-20", "time": "20:00", "url": "https://zoomfrankfurt.com/programm"},
    {"name": "Sunday Service", "genre": "House", "location": "Silbergold", "latitude": 50.1144, "longitude": 8.6921, "date": "2025-08-21", "time": "23:59", "url": "https://silbergold-club.de/"},
    {"name": "AfterWork Clubbing", "genre": "House/Charts", "location": "Gibson Club", "latitude": 50.1162, "longitude": 8.6833, "date": "2025-08-18", "time": "22:00", "url": "https://gibson-club.de/"},
    {"name": "HumMod – Golden Hour", "genre": "House", "location": "Fortuna Irgendwo", "latitude": 50.1106, "longitude": 8.7167, "date": "2025-08-22", "time": "19:00", "url": "https://fortunairgendwo.ticket.io/"},
    {"name": "Electric Grooves x Berliner Nächte", "genre": "Techno/House", "location": "Tanzhaus West", "latitude": 50.098, "longitude": 8.6464, "date": "2025-08-23", "time": "23:00", "url": "https://milchsackfabrik.ticket.io/n8p3ehrp/"},
    {"name": "Wild at Heart", "genre": "Rock/Pop", "location": "Chinaski", "latitude": 50.117, "longitude": 8.6675, "date": "2025-08-22", "time": "22:00", "url": "https://chinaskiclub.de/"},
    {"name": "World Club Dome – Zombie On Tour", "genre": "Hardstyle", "location": "ZOOM Frankfurt", "latitude": 50.116, "longitude": 8.7058, "date": "2025-08-23", "time": "23:00", "url": "https://zoomfrankfurt.com/programm"},
    {"name": "BRISA Latin Party", "genre": "Latin", "location": "Fortuna Irgendwo", "latitude": 50.1106, "longitude": 8.7167, "date": "2025-08-23", "time": "22:00", "url": "https://fortunairgendwo.ticket.io/"},
    {"name": "Old But Gold Ü30 Hip Hop Open Air", "genre": "Hip Hop", "location": "Batschkapp", "latitude": 50.1309, "longitude": 8.7602, "date": "2025-08-23", "time": "15:00", "url": "https://batschkapp.net/batschkapp"},
    {"name": "Out of Office (OOO)", "genre": "House", "location": "Chinaski", "latitude": 50.117, "longitude": 8.6675, "date": "2025-08-27", "time": "18:00", "url": "https://chinaskiclub.de/"},
    {"name": "Die Krupps 45th Anniversary Tour", "genre": "Industrial/Metal", "location": "ZOOM Frankfurt", "latitude": 50.116, "longitude": 8.7058, "date": "2025-08-29", "time": "18:00", "url": "https://zoomfrankfurt.com/programm"},
    {"name": "Tokonoma House Night", "genre": "House/Techno", "location": "Tokonoma", "latitude": 50.112, "longitude": 8.681, "date": "2025-08-29", "time": "22:00", "url": "https://xceed.me/en/frankfurt/club/tokonoma"},
    {"name": "ZirKuss", "genre": "Circus/Club", "location": "Pik Dame", "latitude": 50.1039, "longitude": 8.6649, "date": "2025-08-29", "time": "23:00", "url": "https://www.pikdamefrankfurt.com"},
    {"name": "Signature House", "genre": "House", "location": "Chinaski", "latitude": 50.117, "longitude": 8.6675, "date": "2025-08-30", "time": "23:00", "url": "https://chinaskiclub.de/"},
    {"name": "Worakls", "genre": "Techno/Electronic", "location": "ZOOM Frankfurt", "latitude": 50.116, "longitude": 8.7058, "date": "2025-08-30", "time": "21:00", "url": "https://zoomfrankfurt.com/programm"},
    {"name": "Pik Dame Hip-Hop", "genre": "Hip Hop", "location": "Pik Dame", "latitude": 50.1039, "longitude": 8.6649, "date": "2025-08-30", "time": "23:00", "url": "https://www.pikdamefrankfurt.com"},
    {"name": "Crucial", "genre": "House/Techno/Breaks", "location": "Silbergold", "latitude": 50.1144, "longitude": 8.6921, "date": "2025-08-15", "time": "23:59", "url": "https://silbergold-club.de/"},
    {"name": "Studenten Party - Semester Opening", "genre": "Student Party/Charts", "location": "Batschkapp", "latitude": 50.1309, "longitude": 8.7602, "date": "2025-08-27", "time": "21:00", "url": "https://www.eventim-light.com/de/a/6645e739ac2ac162751894fc/"},
    {"name": "Mind Games", "genre": "Techno", "location": "Gibson Club", "latitude": 50.1162, "longitude": 8.6833, "date": "2025-08-15", "time": "23:00", "url": "https://gibson-club.de/"},
    {"name": "Gibson Loves Saturdays", "genre": "House", "location": "Gibson Club", "latitude": 50.1162, "longitude": 8.6833, "date": "2025-08-16", "time": "23:00", "url": "https://gibson-club.de/"},
    {"name": "Wild at Heart", "genre": "Rock/Pop", "location": "Chinaski", "latitude": 50.117, "longitude": 8.6675, "date": "2025-08-29", "time": "22:00", "url": "https://chinaskiclub.de/"},
    {"name": "Wild at Heart", "genre": "Rock/Pop", "location": "Chinaski", "latitude": 50.117, "longitude": 8.6675, "date": "2025-09-05", "time": "22:00", "url": "https://chinaskiclub.de/"},
    {"name": "Gibson Loves Olen", "genre": "House", "location": "Gibson Club", "latitude": 50.1162, "longitude": 8.6833, "date": "2025-08-23", "time": "23:00", "url": "https://gibson-club.de/"}
  ];

  // Supabase configuration
  // The user has provided a project URL and anon key; these constants are used
  // throughout the code to read and write the global flame counts.  Each row in
  // the `flame_counts` table stores an `event_id` and its associated
  // flame count.  When a user votes for an event, we increment the count on
  // the server rather than in localStorage.  The localStorage is now only
  // used to enforce a two minute cool‑down per user.
  const SUPABASE_URL = 'https://wzhkyieqtovzlqjncugq.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6aGt5aWVxdG92emxxam5jdWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzYwOTEsImV4cCI6MjA3MDE1MjA5MX0.bo731aSOB2Shsj30lZReaUBL0plaZioJGa_XeeYbHN4';
  const TABLE_NAME = 'flame_counts';
  // Keep a local cache of flame counts keyed by event ID
  let flameCounts = {};

  /**
   * Fetch all flame counts from Supabase and populate the flameCounts object.
   * If the table does not exist or returns an error, flameCounts remains
   * empty and the application will still function, albeit without global
   * persistence.  Errors are logged to the console.
   */
  async function fetchFlameCounts() {
    try {
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}?select=event_id,count`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      });
      if (!resp.ok) {
        throw new Error('Failed to fetch flame counts');
      }
      const data = await resp.json();
      flameCounts = {};
      data.forEach(row => {
        flameCounts[row.event_id] = row.count;
      });
    } catch (err) {
      console.error('Error retrieving flame counts from Supabase:', err);
    }
  }

  /**
   * Increment the flame count for the specified event on Supabase.  If a row
   * does not yet exist for the event, it is inserted.  The local cache is
   * updated after the operation completes.  Any network errors will be
   * surfaced in the console; the UI will still update using the cached
   * values.
   * @param {string} eventId
   */
  async function incrementFlame(eventId) {
    const current = flameCounts[eventId] || 0;
    // If no record exists yet, insert one with count 1
    try {
      if (current === 0) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation'
          },
          body: JSON.stringify({ event_id: eventId, count: 1 })
        });
        if (!res.ok) throw new Error('Insert failed');
        const data = await res.json();
        if (data && data.length > 0) {
          flameCounts[eventId] = data[0].count;
        } else {
          flameCounts[eventId] = 1;
        }
      } else {
        // Otherwise update the existing row
        const newCount = current + 1;
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}?event_id=eq.${encodeURIComponent(eventId)}`, {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation'
          },
          body: JSON.stringify({ count: newCount })
        });
        if (!res.ok) throw new Error('Update failed');
        const data = await res.json();
        if (data && data.length > 0) {
          flameCounts[eventId] = data[0].count;
        } else {
          flameCounts[eventId] = newCount;
        }
      }
    } catch (err) {
      console.error('Error updating flame count:', err);
      // Fallback: update local cache anyway so UI reflects action immediately
      flameCounts[eventId] = (flameCounts[eventId] || 0) + 1;
    }
  }

  /**
   * Update the global flame counter displayed in the header.  This should be
   * called after any change to flameCounts to keep the UI in sync.
   */
  function updateGlobalFlame() {
    const total = Object.values(flameCounts).reduce((a, b) => a + b, 0);
    const globalEl = document.getElementById('global-flame-count');
    if (globalEl) {
      globalEl.textContent = total;
    }
  }

  let events = [];
  // Array of dates (YYYY-MM-DD) for events currently in the top three. Used to
  // mark days in the calendar with a flame icon when a hot event occurs.
  let hotDates = [];
  let currentWeekStart;
  let selectedDate;

  /**
   * Calculate the Monday of the week containing the provided date.
   * @param {Date} date
   * @returns {Date}
   */
  function getWeekStart(date) {
    const d = new Date(date);
    const dayIndex = d.getUTCDay(); // 0 = Sun, 1 = Mon, ...
    const mondayOffset = dayIndex === 0 ? -6 : 1 - dayIndex;
    d.setUTCDate(d.getUTCDate() + mondayOffset);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Format a date as YYYY‑MM‑DD.
   * @param {Date} d
   * @returns {string}
   */
  function toISODate(d) {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin' }).format(d);
  }

  // Helper to get current date/time in Berlin timezone
  function getBerlinToday() {
    const berlinString = new Date().toLocaleString('en-CA', { timeZone: 'Europe/Berlin', hour12: false });
    return new Date(berlinString);
  }

  /**
   * Get today's date in the Europe/Berlin timezone.
   * @returns {Date}
   */
  function getBerlinToday() {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Berlin',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const iso = formatter.format(new Date());
    return new Date(iso);
  }

  /**
   * Read vote count for a given event ID from localStorage.
   * @param {string} eventId
   */
  function getVoteCount(eventId) {
    // Use the global flameCounts map (populated from Supabase) to determine
    // the current vote total.  If no entry exists yet, assume zero.  The
    // previous localStorage mechanism is retained only for enforcing the
    // per‑user cool‑down.
    return flameCounts[eventId] || 0;
  }

  /**
   * Persist vote count to localStorage.
   * @param {string} eventId
   * @param {number} count
   */
  function setVoteCount(eventId, count) {
    localStorage.setItem('vote_' + eventId, String(count));
  }

  /**
   * Get last vote timestamp for event from localStorage (ms since epoch).
   * @param {string} eventId
   */
  function getLastVoteTime(eventId) {
    const val = localStorage.getItem('lastVote_' + eventId);
    return val ? parseInt(val, 10) : 0;
  }

  /**
   * Set last vote timestamp (ms since epoch).
   * @param {string} eventId
   * @param {number} ts
   */
  function setLastVoteTime(eventId, ts) {
    localStorage.setItem('lastVote_' + eventId, String(ts));
  }

  /**
   * Vote for the specified event. Enforces a two minute cool‑down.
   * @param {Object} eventObj
   */
  async function vote(eventObj) {
    const id = eventObj.id;
    const now = Date.now();
    const last = getLastVoteTime(id);
    const cooldown = 2 * 60 * 1000; // 2 minutes
    if (now - last < cooldown) {
      const remaining = Math.ceil((cooldown - (now - last)) / 1000);
      alert(`Bitte warte noch ${remaining} Sekunden bevor du erneut für dieses Event abstimmst.`);
      return;
    }
    // Persist the vote to Supabase and update the local cache
    await incrementFlame(id);
    // Record the time of the vote in localStorage to enforce cooldown
    setLastVoteTime(id, now);
    // Update the global flame display
    updateGlobalFlame();
    // Re-render UI elements dependent on vote counts
    renderHotThree();
    renderEventList();
  }

  /**
   * Compute neon accent color based on genre keywords.
   * @param {string} genre
   * @returns {string}
   */
  function getColorForGenre(genre) {
    // Normalize genre string for matching
    const g = genre.toLowerCase();
    if (g.includes('house') && g.includes('techno')) return '#00ffff';
    if (g.includes('techno')) return '#00bfff';
    if (g.includes('house')) return '#39ff14';
    if (g.includes('pop hits')) return '#ff69b4';
    if (g.includes('pop')) return '#ff1493';
    if (g.includes('rock')) return '#ffa500';
    if (g.includes('metal') && g.includes('hardcore')) return '#8b0000';
    if (g.includes('metal')) return '#ff4500';
    if (g.includes('hip hop') || g.includes('hiphop')) return '#9400d3';
    if (g.includes('r&b')) return '#9370db';
    if (g.includes('latin') || g.includes('cumbia')) return '#ffd700';
    if (g.includes('festival')) return '#00ff7f';
    if (g.includes('electronic')) return '#7b68ee';
    if (g.includes('k-pop') || g.includes('kpop')) return '#da70d6';
    if (g.includes('amapiano') || g.includes('afro')) return '#800080';
    if (g.includes('breaks')) return '#00fa9a';
    return '#00ffff';
  }

  /**
   * Render the day selector for the current week.
   */
  function renderDaySelector() {
    daySelectorEl.innerHTML = '';
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(currentWeekStart.getDate() + i);
      days.push(d);
    }
    // Precompute event counts for each day in the current week
    const counts = {};
    let maxCount = 0;
    days.forEach(d => {
      const isoDate = toISODate(d);
      const count = events.filter(ev => ev.date === isoDate).length;
      counts[isoDate] = count;
      if (count > maxCount) maxCount = count;
    });

    days.forEach(d => {
      const iso = toISODate(d);
      const dayEl = document.createElement('div');
      dayEl.className = 'day';
      if (iso === toISODate(selectedDate)) {
        dayEl.classList.add('active');
      }
      dayEl.dataset.date = iso;
      const weekday = d.toLocaleDateString('de-DE', { weekday: 'short' });
      const dayNum = d.getDate();
      const weekdayEl = document.createElement('div');
      weekdayEl.className = 'weekday';
      weekdayEl.textContent = weekday;
      const dateEl = document.createElement('div');
      dateEl.className = 'date';
      dateEl.textContent = dayNum;
      dayEl.appendChild(weekdayEl);
      dayEl.appendChild(dateEl);
      dayEl.addEventListener('click', () => {
        selectedDate = new Date(dayEl.dataset.date);
        renderDaySelector();
        renderEventList();
      });
      // Apply color intensity based on number of events for this date
      const count = counts[iso] || 0;
      if (count > 0 && maxCount > 0) {
        const ratio = count / maxCount;
        const alpha = 0.05 + ratio * 0.4; // from 0.05 to 0.45
        dayEl.style.backgroundColor = `rgba(255, 0, 0, ${alpha.toFixed(2)})`;
      }
      // If this date hosts any of the top three events, add a flame icon
      if (hotDates && hotDates.includes(iso)) {
        const flame = document.createElement('div');
        flame.className = 'hot-icon';
        flame.textContent = '🔥';
        dayEl.appendChild(flame);
      }
      daySelectorEl.appendChild(dayEl);
    });
    // Update week range text
    const end = new Date(currentWeekStart);
    end.setDate(currentWeekStart.getDate() + 6);
    const options = { month: 'short', day: 'numeric' };
    const startStr = currentWeekStart.toLocaleDateString('en-US', options);
    const endStr = end.toLocaleDateString('en-US', options);
    const year = currentWeekStart.getFullYear();
    weekRangeEl.textContent = `${startStr} - ${endStr}, ${year}`;
  }

  /**
   * Render event cards for the selected day.
   */
  function renderEventList() {
    eventListEl.innerHTML = '';
    const selectedIso = toISODate(selectedDate);
    const eventsForDay = events.filter(ev => ev.date === selectedIso);
    // Sort by time ascending
    eventsForDay.sort((a, b) => {
      if (a.time < b.time) return -1;
      if (a.time > b.time) return 1;
      return 0;
    });
    if (eventsForDay.length === 0) {
      const msg = document.createElement('div');
      msg.textContent = 'Keine Events an diesem Tag.';
      msg.style.color = '#8888aa';
      eventListEl.appendChild(msg);
      // Still show all available locations even when no events on this day
      renderLocationList();
      return;
    }
    eventsForDay.forEach(ev => {
      const card = document.createElement('div');
      card.className = 'event-card';
      // Color accent
      const color = getColorForGenre(ev.genre || '');
      card.style.borderLeftColor = color;
      // Info section
      const info = document.createElement('div');
      info.className = 'info';
      const title = document.createElement('h3');
      title.textContent = ev.name;
      const meta = document.createElement('div');
      meta.className = 'meta';
      // Build date display: if event is today show 'Heute', else show 'YYYY-MM-DD – weekday'
      const eventDate = new Date(ev.date);
      const weekdayLong = eventDate.toLocaleDateString('de-DE', { weekday: 'long' });
      const todayIsoLocal = toISODate(getBerlinToday());
      const datePart = (ev.date === todayIsoLocal) ? 'Heute' : `${ev.date} – ${weekdayLong}`;
      meta.textContent = `${datePart} | ${ev.time}`;
      const loc = document.createElement('div');
      loc.className = 'location';
      loc.textContent = ev.location;
      info.appendChild(title);
      info.appendChild(meta);
      info.appendChild(loc);
      // Links: Map and Event
      const links = document.createElement('div');
      links.className = 'links';
      // Map link: use latitude/longitude if available, otherwise fallback to encoded location
      const mapAnchor = document.createElement('a');
      if (ev.latitude && ev.longitude) {
        mapAnchor.href = `https://www.google.com/maps/search/?api=1&query=${ev.latitude},${ev.longitude}`;
      } else {
        const encodedLoc = encodeURIComponent(ev.location);
        mapAnchor.href = `https://www.google.com/maps/search/?api=1&query=${encodedLoc}`;
      }
      mapAnchor.target = '_blank';
      mapAnchor.rel = 'noopener';
      mapAnchor.textContent = 'Map';
      // Event link
      const eventAnchor = document.createElement('a');
      eventAnchor.href = ev.url;
      eventAnchor.target = '_blank';
      eventAnchor.rel = 'noopener';
      eventAnchor.textContent = 'Event';
      links.appendChild(mapAnchor);
      links.appendChild(eventAnchor);
      info.appendChild(links);
      // Vote section
      const voteDiv = document.createElement('div');
      voteDiv.className = 'vote';
      voteDiv.title = 'Vote for this event';
      // Flame emoji and vote count
      voteDiv.innerHTML = '';
      const emoji = document.createElement('div');
      emoji.textContent = '🔥';
      emoji.style.fontSize = '24px';
      emoji.style.lineHeight = '1';
      emoji.style.marginBottom = '0.1rem';
      voteDiv.appendChild(emoji);
      const count = document.createElement('div');
      count.className = 'count';
      count.textContent = getVoteCount(ev.id);
      voteDiv.appendChild(count);
      voteDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        vote(ev);
      });
      card.appendChild(info);
      card.appendChild(voteDiv);
      eventListEl.appendChild(card);
    });
    // After rendering events, update the locations list
    renderLocationList();
  }

  /**
   * Render the top three events based on votes.
   */
  function renderHotThree() {
    // Always update the global flame counter at the start so that the header reflects
    // any changes in vote totals before displaying the top three events.
    updateGlobalFlame();
    hotThreeEl.innerHTML = '';
    if (events.length === 0) return;
    // Map events to an array with vote counts
    const ranked = events.map(ev => ({ ev, votes: getVoteCount(ev.id) }));
    ranked.sort((a, b) => b.votes - a.votes);
    const top = ranked.slice(0, 3);
    // Track which dates host the top events
    hotDates = top.map(item => item.ev.date);
    top.forEach((item, index) => {
      const { ev, votes } = item;
      const card = document.createElement('div');
      card.className = 'event-card';
      card.classList.add(`rank-${index + 1}`);
      // Color accent based on genre
      const color = getColorForGenre(ev.genre || '');
      card.style.borderLeftColor = color;
      // Info
      const info = document.createElement('div');
      info.className = 'info';
      const title = document.createElement('h3');
      title.textContent = ev.name;
      const meta = document.createElement('div');
      meta.className = 'meta';
      const eventDateH = new Date(ev.date);
      const weekdayLongH = eventDateH.toLocaleDateString('de-DE', { weekday: 'long' });
      const todayIsoLocalH = toISODate(getBerlinToday());
      const datePartH = (ev.date === todayIsoLocalH) ? 'Heute' : `${ev.date} – ${weekdayLongH}`;
      meta.textContent = `${datePartH} | ${ev.time}`;
      const loc = document.createElement('div');
      loc.className = 'location';
      loc.textContent = ev.location;
      info.appendChild(title);
      info.appendChild(meta);
      info.appendChild(loc);
      // Links: Map and Event
      const links = document.createElement('div');
      links.className = 'links';
      const mapA = document.createElement('a');
      if (ev.latitude && ev.longitude) {
        mapA.href = `https://www.google.com/maps/search/?api=1&query=${ev.latitude},${ev.longitude}`;
      } else {
        const encodedLoc = encodeURIComponent(ev.location);
        mapA.href = `https://www.google.com/maps/search/?api=1&query=${encodedLoc}`;
      }
      mapA.target = '_blank';
      mapA.rel = 'noopener';
      mapA.textContent = 'Map';
      const eventA = document.createElement('a');
      eventA.href = ev.url;
      eventA.target = '_blank';
      eventA.rel = 'noopener';
      eventA.textContent = 'Event';
      links.appendChild(mapA);
      links.appendChild(eventA);
      info.appendChild(links);
      // Vote
      const voteDiv = document.createElement('div');
      voteDiv.className = 'vote';
      const emojiDiv = document.createElement('div');
      emojiDiv.textContent = '🔥';
      emojiDiv.style.fontSize = '24px';
      emojiDiv.style.lineHeight = '1';
      emojiDiv.style.marginBottom = '0.1rem';
      voteDiv.appendChild(emojiDiv);
      const countEl = document.createElement('div');
      countEl.className = 'count';
      countEl.textContent = votes;
      voteDiv.appendChild(countEl);
      voteDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        vote(ev);
      });
      card.appendChild(info);
      card.appendChild(voteDiv);
      hotThreeEl.appendChild(card);
    });
    // Re-render the day selector to refresh hot icons after computing new hot events
    renderDaySelector();
  }

  /**
   * Initialise the page: load events, set up week navigation and default dates.
   */
  async function init() {
    // Determine current date (use the user's timezone). If the current date is
    // outside the range of available events, the earliest event date is used
    // instead.
    const today = getBerlinToday();
    // Load events from the JSON file or fall back to the embedded array on
    // failure.  Each event receives a unique ID composed of its name, date and
    // time.
    try {
      const res = await fetch('events.json');
      if (!res.ok) throw new Error('Failed to fetch events.json');
      const data = await res.json();
      events = data.map(ev => {
        const id = `${ev.name}|${ev.date}|${ev.time}`;
        return { ...ev, id };
      });
    } catch (err) {
      events = EVENTS_DATA.map(ev => {
        const id = `${ev.name}|${ev.date}|${ev.time}`;
        return { ...ev, id };
      });
    }
    // Determine the default selected date
    if (events.length > 0) {
      const eventDates = events.map(e => e.date).sort();
      const earliest = eventDates[0];
      const latest = eventDates[eventDates.length - 1];
      const todayIso = toISODate(today);
      if (todayIso < earliest || todayIso > latest) {
        selectedDate = new Date(earliest);
      } else {
        selectedDate = new Date(todayIso);
      }
    } else {
      selectedDate = today;
    }
    currentWeekStart = getWeekStart(selectedDate);
    // Retrieve the current flame counts from Supabase and update the header
    await fetchFlameCounts();
    updateGlobalFlame();
    // Render initial UI
    renderDaySelector();
    renderHotThree();
    renderEventList();
    renderLocationList();
    // Week navigation buttons
    prevWeekBtn.addEventListener('click', () => {
      currentWeekStart.setDate(currentWeekStart.getDate() - 7);
      if (selectedDate < currentWeekStart || selectedDate > new Date(currentWeekStart.getTime() + 6 * 24 * 3600 * 1000)) {
        selectedDate = new Date(currentWeekStart);
      }
      renderDaySelector();
      renderEventList();
    });
    nextWeekBtn.addEventListener('click', () => {
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      if (selectedDate < currentWeekStart || selectedDate > new Date(currentWeekStart.getTime() + 6 * 24 * 3600 * 1000)) {
        selectedDate = new Date(currentWeekStart);
      }
      renderDaySelector();
      renderEventList();
      renderLocationList();
    });
    // Today button: jump to current date and week
    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        const now = getBerlinToday();
        const todayIso = toISODate(now);
        selectedDate = new Date(todayIso);
        currentWeekStart = getWeekStart(selectedDate);
        renderDaySelector();
        renderEventList();
        renderLocationList();
      });
    }
  }

  // Wait until the DOM is loaded before initialising the app.  We wrap the
  // call to init() in an arrow function so that any returned promise is not
  // inadvertently treated as a listener return value.
  document.addEventListener('DOMContentLoaded', () => { init(); });

  /**
   * Render a list of all unique event locations. Each location appears as a
   * badge within the location list container at the bottom of the events
   * section. This provides a quick overview of where events are happening.
   */
  function renderLocationList() {
    if (!locationListEl) return;
    // Compute unique locations sorted alphabetically
    const unique = Array.from(new Set(events.map(ev => ev.location))).sort();
    locationListEl.innerHTML = '';
    unique.forEach(loc => {
      const item = document.createElement('div');
      item.className = 'location-item';
      item.textContent = loc;
      locationListEl.appendChild(item);
    });
  }
})();
