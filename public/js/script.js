const body = document.querySelector("body");
const sidebar = body.querySelector("nav");
const toggle = body.querySelector(".toggle");
const searchBtn = body.querySelector(".search-box");
const modeSwitch = body.querySelector(".toggle-switch");
const modeText = body.querySelector(".mode-text");

toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
});

searchBtn.addEventListener("click", () => {
    sidebar.classList.remove("close");
});

modeSwitch.addEventListener("click", () => {
    body.classList.toggle("dark");
    if (body.classList.contains("dark")) {
        modeText.innerText = "Light mode"
    } else {
        modeText.innerText = "Dark mode"
    }
});

document.addEventListener('DOMContentLoaded', () => {
  const profileBtn = document.getElementById('profileBtn');
  const profileDropdown = document.getElementById('profileDropdown');

  if (!profileBtn || !profileDropdown) return;

  const toggleDropdown = (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle('open');
  };

  const closeDropdown = () => {
    profileDropdown.classList.remove('open');
  };

  // abrir/cerrar con click
  profileBtn.addEventListener('click', toggleDropdown);

  // cerrar al hacer click fuera
  document.addEventListener('click', closeDropdown);

  // prevenir cierre cuando hago click dentro
  profileDropdown.addEventListener('click', (e) => e.stopPropagation());

  // cerrar con escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDropdown();
  });
});

// === Calendario ===
const daysContainer = document.getElementById("days");
const monthYear = document.getElementById("monthYear");
const prev = document.getElementById("prev");
const next = document.getElementById("next");

let date = new Date();

function renderCalendar() {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  monthYear.innerText = date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  daysContainer.innerHTML = "";

  for (let i = 0; i < firstDay; i++) {
    daysContainer.innerHTML += `<div></div>`;
  }

  for (let i = 1; i <= lastDate; i++) {
    let today = (i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear())
      ? "today" : "";
    daysContainer.innerHTML += `<div class="${today}">${i}</div>`;
  }
}

prev.addEventListener("click", () => {
  date.setMonth(date.getMonth() - 1);
  renderCalendar();
});

next.addEventListener("click", () => {
  date.setMonth(date.getMonth() + 1);
  renderCalendar();
});

renderCalendar();



