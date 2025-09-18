<<<<<<< HEAD
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


=======
document.addEventListener('DOMContentLoaded', () => {
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    if (!profileBtn || !profileDropdown){
        return;
    }
    const openDropdown = () => {
        profileDropdown.classList.add('open');
    }
    const closeDropdown = () => {
        profileDropdown.classList.remove('open');
    }
    const toggleDropdown = (e) => {
        e && e.stopPropagation();
        if(profileDropdown.classList.contains('open')) {
            closeDropdown();
        } else {
            openDropdown();
        }
    }
    profileBtn.addEventListener('click', toggleDropdown);
    profileBtn.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' '){
            ev.preventDefault();
            toggleDropdown(ev);
        }
    });
    profileDropdown.addEventListener('click', (ev) => {
        ev.stopPropagation();
    });
    document.addEventListener('click', () => {
        closeDropdown();
    });
    document.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape'){
            closeDropdown();
        }
    });
    profileDropdown.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('click', () => {
            closeDropdown();
        })
    });
})
>>>>>>> ff2b1501a35b089dd10d52e52d52bb6ac43f78f3
