const STORAGE_KEY = "just-watched-log";

const form = document.getElementById("log-form");
const titleInput = document.getElementById("title");
const noteInput = document.getElementById("note");
const ratingInput = document.getElementById("rating");
const submit = document.getElementById("submit");
const stars = [...document.querySelectorAll(".star")];
const list = document.getElementById("list");
const empty = document.getElementById("empty");
const count = document.getElementById("count");
const toast = document.getElementById("toast");

let toastTimer;

function loadEntries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function setRating(value) {
  ratingInput.value = String(value);
  stars.forEach((star) => {
    const on = Number(star.dataset.value) <= value;
    star.classList.toggle("on", on);
    star.setAttribute("aria-pressed", on ? "true" : "false");
  });
  updateSubmit();
}

function updateSubmit() {
  submit.disabled = !(titleInput.value.trim() && ratingInput.value);
}

function formatWhen(iso) {
  const date = new Date(iso);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function starLabel(n) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 2200);
}

function render() {
  const entries = loadEntries();
  list.innerHTML = "";
  empty.hidden = entries.length > 0;
  count.textContent = entries.length
    ? `${entries.length} movie${entries.length === 1 ? "" : "s"}`
    : "";

  entries.forEach((entry) => {
    const li = document.createElement("li");
    li.className = "card";
    li.innerHTML = `
      <div class="card-top">
        <h3></h3>
        <p class="stars-read"></p>
      </div>
      <p class="note" hidden></p>
      <div class="meta">
        <span></span>
        <button type="button" class="delete">Remove</button>
      </div>
    `;
    li.querySelector("h3").textContent = entry.title;
    li.querySelector(".stars-read").textContent = starLabel(entry.rating);
    const note = li.querySelector(".note");
    if (entry.note) {
      note.hidden = false;
      note.textContent = entry.note;
    }
    li.querySelector(".meta span").textContent = formatWhen(entry.at);
    li.querySelector(".delete").addEventListener("click", () => {
      const next = loadEntries().filter((item) => item.id !== entry.id);
      saveEntries(next);
      render();
    });
    list.appendChild(li);
  });
}

stars.forEach((star) => {
  star.addEventListener("click", () => setRating(Number(star.dataset.value)));
});

titleInput.addEventListener("input", updateSubmit);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const rating = Number(ratingInput.value);
  const note = noteInput.value.trim();
  if (!title || !rating) return;

  const entries = loadEntries();
  entries.unshift({
    id: crypto.randomUUID(),
    title,
    rating,
    note,
    at: new Date().toISOString(),
  });
  saveEntries(entries);

  form.reset();
  ratingInput.value = "";
  stars.forEach((star) => {
    star.classList.remove("on");
    star.setAttribute("aria-pressed", "false");
  });
  updateSubmit();
  render();
  titleInput.focus();
  showToast("Logged. Back to your night.");
});

render();
titleInput.focus();

