const body = document.querySelector("body");
const sidebar = body.querySelector("nav");
const toggle = body.querySelector(".toggle");
const searchBtn = body.querySelector(".search-box");
const modeSwitch = body.querySelector(".toggle-switch");
const mobileMenuToggle = body.querySelector("#mobileMenuToggle");
const sidebarOverlay = body.querySelector("#sidebarOverlay");
modeText = body.querySelector(".mode-text");

toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
});

searchBtn.addEventListener("click", () => {
    sidebar.classList.remove("close");
});

// Función para abrir el sidebar en móviles
const openMobileSidebar = () => {
    sidebar.classList.add("open");
    sidebar.classList.remove("close");
    sidebarOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
};

// Función para cerrar el sidebar en móviles
const closeMobileSidebar = () => {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("active");
    document.body.style.overflow = "";
};

// Event listener para el botón de menú móvil
if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", () => {
        if (sidebar.classList.contains("open")) {
            closeMobileSidebar();
        } else {
            openMobileSidebar();
        }
    });
}

// Event listener para el overlay
if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeMobileSidebar);
}

if (modeSwitch) {
    modeSwitch.addEventListener("click", () => {
        body.classList.toggle("dark");
        if (body.classList.contains("dark")) {
            modeText.innerText = "Light mode"
        } else {
            modeText.innerText = "Dark mode"
        }
    });
}

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


