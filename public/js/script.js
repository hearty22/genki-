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