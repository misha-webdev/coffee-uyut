// =========================================================
// ИНТЕРАКТИВНОСТЬ САЙТА КОФЕЙНИ «УЮТ»
// =========================================================

// Находим на странице нужные элементы по их id
const header = document.getElementById('header');
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav__link');

// ---------- 1. Мобильное меню (бургер) ----------
function closeMenu() {
    nav.classList.remove('nav--open');
    burger.classList.remove('burger--open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
}

burger.addEventListener('click', function () {
    const isOpen = nav.classList.toggle('nav--open');
    burger.classList.toggle('burger--open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
});

// После нажатия на пункт меню закрываем панель
navLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
});

// ---------- 2. Тень у шапки при прокрутке ----------
function updateHeaderShadow() {
    header.classList.toggle('header--scrolled', window.scrollY > 10);
}

window.addEventListener('scroll', updateHeaderShadow);
updateHeaderShadow();

// ---------- 3. Подсветка пункта меню текущего раздела ----------
const sections = document.querySelectorAll('main section[id]');

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        navLinks.forEach(function (link) {
            const isCurrent = link.getAttribute('href') === '#' + entry.target.id;
            link.classList.toggle('nav__link--active', isCurrent);
        });
    });
}, {
    // раздел считается «текущим», когда он в средней части экрана
    rootMargin: '-45% 0px -50% 0px'
});

sections.forEach(function (section) {
    observer.observe(section);
});

// ---------- 4. Текущий год в подвале ----------
document.getElementById('year').textContent = new Date().getFullYear();
