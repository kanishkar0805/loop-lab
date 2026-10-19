// ============================================================
// Loop Lab: script.js
// Features: mobile nav, live countdown, event filter + RSVP,
// team carousel, join form with membership card, FAQ accordion.
// ============================================================

// ---------- Small helpers ----------
const $ = (selector) => document.querySelector(selector);

const toast = $("#toast");
let toastTimer = null;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

// Build a date that is always in the future: "n days from today at the given hour".
// This way the countdown never shows an event that has already happened.
function inDays(n, hour) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hour, 0, 0, 0);
  return d;
}

// ---------- Data (edit these lists to change the content) ----------
const events = [
  { id: "git",   type: "Workshop",  title: "Git and GitHub in one hour",        where: "Lab B12",        when: inDays(4, 17),  info: "Save your work, undo mistakes and publish your first repository." },
  { id: "web",   type: "Workshop",  title: "Build your first website",          where: "Lab B12",        when: inDays(9, 16),  info: "HTML and CSS from zero. You will have a live page by the end." },
  { id: "alumni", type: "Talk",     title: "From campus to first job",          where: "Seminar Hall 2", when: inDays(13, 18), info: "Two alumni share how they got their first internships." },
  { id: "oss",   type: "Talk",      title: "How to read other people's code",   where: "Seminar Hall 2", when: inDays(17, 17), info: "A practical guide to understanding a project you did not write." },
  { id: "ml",    type: "Workshop",  title: "Intro to machine learning",         where: "Lab A3",         when: inDays(24, 16), info: "Train a small model that sorts flowers, then improve it." },
  { id: "jam",   type: "Hackathon", title: "Loop Jam: 24-hour mini hackathon",  where: "Main Hall",      when: inDays(31, 10), info: "Teams of four, one idea, one day. Food and prizes included." }
];

const team = [
  { name: "Aarav Menon",  role: "President",        bio: "Third-year CS. Runs the club and still debugs with print statements.",   color: "#FF5A36" },
  { name: "Isha Kapoor",  role: "Workshops lead",   bio: "Second-year IT. Turns hard topics into one-hour sessions.",               color: "#35D6A4" },
  { name: "Rohan Das",    role: "Hackathon captain", bio: "Third-year ECE. Has won two hackathons and lost sleep at both.",        color: "#FFD23F" },
  { name: "Meera Iyer",   role: "Design lead",      bio: "Second-year Design. Makes every poster and every button look good.",      color: "#FF5A36" },
  { name: "Kabir Shah",   role: "Treasurer",        bio: "Fourth-year Maths. Keeps the budget and the snack supply in order.",      color: "#35D6A4" },
  { name: "Tara Nair",    role: "Outreach",         bio: "First-year CS. Makes sure new members feel welcome from day one.",        color: "#FFD23F" }
];

// ---------- 1. Mobile navigation ----------
const navToggle = $("#navToggle");
const siteNav = $("#siteNav");

function setNav(open) {
  siteNav.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

navToggle.addEventListener("click", () => setNav(!siteNav.classList.contains("is-open")));
siteNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setNav(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });

// ---------- 2. Live countdown to the next event ----------
const nextEvent = events.slice().sort((a, b) => a.when - b.when)[0];

function formatWhen(date) {
  return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) +
         ", " + date.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true });
}

$("#cdTitle").textContent = nextEvent.title;
$("#cdWhere").textContent = formatWhen(nextEvent.when) + " · " + nextEvent.where;

function tickCountdown() {
  const diff = Math.max(0, nextEvent.when - new Date());
  const totalSeconds = Math.floor(diff / 1000);
  $("#cdDays").textContent = Math.floor(totalSeconds / 86400);
  $("#cdHours").textContent = Math.floor((totalSeconds % 86400) / 3600);
  $("#cdMins").textContent = Math.floor((totalSeconds % 3600) / 60);
  $("#cdSecs").textContent = totalSeconds % 60;
}
tickCountdown();
setInterval(tickCountdown, 1000);

// ---------- 3. Events: filter + RSVP ----------
const eventList = $("#eventList");
const filterBox = $("#filters");
const rsvpCount = $("#rsvpCount");
let activeFilter = "all";
let going = loadGoing();

// RSVPs are remembered in the browser (localStorage). try/catch keeps the site
// working even if storage is blocked, for example in a private window.
function loadGoing() {
  try { return JSON.parse(localStorage.getItem("looplab-going")) || []; }
  catch (err) { return []; }
}
function saveGoing() {
  try { localStorage.setItem("looplab-going", JSON.stringify(going)); }
  catch (err) { /* storage unavailable: RSVPs just won't persist */ }
}

function renderEvents() {
  eventList.innerHTML = "";
  const visible = events.filter((ev) => activeFilter === "all" || ev.type === activeFilter);

  visible.forEach((ev) => {
    const isGoing = going.includes(ev.id);
    const day = ev.when.getDate();
    const month = ev.when.toLocaleDateString("en-GB", { month: "short" });
    const time = ev.when.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true });

    const li = document.createElement("li");
    li.className = "event";
    li.dataset.type = ev.type;
    li.innerHTML =
      '<div class="event-date"><strong>' + day + "</strong><span>" + month + "</span></div>" +
      '<div class="event-body">' +
        '<span class="event-tag">' + ev.type + "</span>" +
        "<h3>" + ev.title + "</h3>" +
        "<p>" + ev.info + " " + time + ", " + ev.where + ".</p>" +
      "</div>" +
      '<div class="event-action">' +
        '<button class="btn btn-small rsvp-btn' + (isGoing ? " is-going" : "") + '" data-id="' + ev.id + '" aria-pressed="' + isGoing + '">' +
          (isGoing ? "You're going" : "RSVP") +
        "</button>" +
      "</div>";
    eventList.appendChild(li);
  });

  const n = going.length;
  rsvpCount.textContent = n === 0
    ? "You haven't RSVP'd to anything yet."
    : "You're going to " + n + (n === 1 ? " event." : " events.");
}

filterBox.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  filterBox.querySelectorAll(".chip").forEach((c) => {
    const active = c === chip;
    c.classList.toggle("is-active", active);
    c.setAttribute("aria-pressed", String(active));
  });
  activeFilter = chip.dataset.filter;
  renderEvents();
});

// One listener on the list handles every RSVP button
eventList.addEventListener("click", (e) => {
  const btn = e.target.closest(".rsvp-btn");
  if (!btn) return;
  const id = btn.dataset.id;
  const ev = events.find((x) => x.id === id);

  if (going.includes(id)) {
    going = going.filter((x) => x !== id);
    showToast("RSVP removed for " + ev.title);
  } else {
    going.push(id);
    showToast("You're going to " + ev.title);
  }
  saveGoing();
  renderEvents();
});

renderEvents();

// ---------- 4. Team carousel ----------
const teamTrack = $("#teamTrack");

team.forEach((m) => {
  const initials = m.name.split(" ").map((part) => part[0]).join("");
  const card = document.createElement("article");
  card.className = "member";
  card.innerHTML =
    '<div class="avatar" style="background:' + m.color + '" aria-hidden="true">' + initials + "</div>" +
    "<h3>" + m.name + "</h3>" +
    '<p class="role">' + m.role + "</p>" +
    "<p>" + m.bio + "</p>";
  teamTrack.appendChild(card);
});

function scrollTeam(direction) {
  const card = teamTrack.querySelector(".member");
  const step = card.offsetWidth + 20; // card width plus the gap
  teamTrack.scrollBy({ left: direction * step, behavior: "smooth" });
}
$("#teamPrev").addEventListener("click", () => scrollTeam(-1));
$("#teamNext").addEventListener("click", () => scrollTeam(1));

// ---------- 5. Join form with validation ----------
const joinForm = $("#joinForm");
const memberCard = $("#memberCard");

function setError(fieldId, message) {
  const input = $("#" + fieldId);
  $("#" + fieldId + "Error").textContent = message;
  input.classList.toggle("is-invalid", message !== "");
}

joinForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("#name").value.trim();
  const email = $("#email").value.trim();
  const year = $("#year").value;
  const interest = $("#interest").value;
  let valid = true;

  if (name.length < 2) { setError("name", "Enter your full name."); valid = false; }
  else setError("name", "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("email", "Enter a valid email, like name@college.edu."); valid = false; }
  else setError("email", "");

  if (year === "") { setError("year", "Choose your year of study."); valid = false; }
  else setError("year", "");

  if (!valid) {
    showToast("Please fix the highlighted fields");
    return;
  }

  // Everything is valid: show the membership card (nothing is sent anywhere)
  const memberNumber = String(Math.floor(100 + Math.random() * 900));
  $("#mcName").textContent = name;
  $("#mcMeta").textContent = year + " · Interested in " + interest.toLowerCase();
  $("#mcId").textContent = "LL-" + new Date().getFullYear() + "-" + memberNumber;
  joinForm.hidden = true;
  memberCard.hidden = false;
  showToast("Welcome to Loop Lab, " + name.split(" ")[0] + "!");
});

$("#mcAnother").addEventListener("click", () => {
  joinForm.reset();
  joinForm.hidden = false;
  memberCard.hidden = true;
});

// ---------- 6. FAQ accordion ----------
$("#faqList").addEventListener("click", (e) => {
  const question = e.target.closest(".faq-q");
  if (!question) return;
  const willOpen = question.getAttribute("aria-expanded") !== "true";

  // Close every answer first, then open the one that was clicked
  document.querySelectorAll(".faq-q").forEach((q) => {
    q.setAttribute("aria-expanded", "false");
    document.getElementById(q.getAttribute("aria-controls")).hidden = true;
  });
  if (willOpen) {
    question.setAttribute("aria-expanded", "true");
    document.getElementById(question.getAttribute("aria-controls")).hidden = false;
  }
});

// ---------- 7. Footer year ----------
$("#year-now").textContent = new Date().getFullYear();
