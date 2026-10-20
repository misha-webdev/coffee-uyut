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

// Закрываем меню клавишей Esc и возвращаем фокус на кнопку-бургер
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav.classList.contains('nav--open')) {
        closeMenu();
        burger.focus();
    }
});

// Закрываем меню, если нажали мимо него
document.addEventListener('click', function (event) {
    const clickedOutside = !nav.contains(event.target) && !burger.contains(event.target);
    if (clickedOutside && nav.classList.contains('nav--open')) {
        closeMenu();
    }
});

// Если экран стал широким (повернули планшет), мобильное меню больше не нужно
window.matchMedia('(min-width: 761px)').addEventListener('change', function (event) {
    if (event.matches) closeMenu();
});

// ---------- 2. Тень у шапки при прокрутке ----------
function updateHeaderShadow() {
    header.classList.toggle('header--scrolled', window.scrollY > 10);
}

// passive: true — сообщаем браузеру, что не мешаем прокрутке, и она остаётся плавной
window.addEventListener('scroll', updateHeaderShadow, { passive: true });
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

// ---------- 5. Появление блоков при прокрутке ----------
// Блоки с атрибутом data-reveal плавно появляются, когда до них долистали.
// Сама анимация описана в style.css (раздел 12), здесь мы только добавляем класс.
const revealItems = document.querySelectorAll('[data-reveal]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
    // Человек просил уменьшить движение — сразу показываем всё без анимации
    revealItems.forEach(function (item) {
        item.classList.add('is-visible');
    });
} else {
    const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target); // анимация срабатывает один раз
        });
    }, {
        // блок начинает появляться, когда его верх чуть-чуть заехал на экран
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.1
    });

    revealItems.forEach(function (item) {
        revealObserver.observe(item);
    });
}

// ---------- 6. Категории меню (вкладки) ----------
const tabList = document.querySelector('.menu-tabs');
const menuTabs = document.querySelectorAll('.menu-tab');
const tabIndicator = document.querySelector('.menu-tabs__indicator');
const menuPanel = document.getElementById('menu-panel');
const menuCards = menuPanel.querySelectorAll('.card');
let switchTimer = null;

// Считаем позиции в каждой категории и пишем число на вкладке
menuTabs.forEach(function (tab) {
    const selector = '.card[data-category="' + tab.dataset.category + '"]';
    tab.querySelector('.menu-tab__count').textContent = menuPanel.querySelectorAll(selector).length;
});

// Перемещаем тёмную «подложку» под выбранную вкладку
function moveIndicator(tab) {
    tabIndicator.style.setProperty('--x', tab.offsetLeft + 'px');
    tabIndicator.style.setProperty('--w', tab.offsetWidth + 'px');
}

// Показываем карточки нужной категории, остальные прячем
function showCards(category, animate) {
    let index = 0;
    menuCards.forEach(function (card) {
        const isMatch = card.dataset.category === category;
        card.hidden = !isMatch;
        card.classList.remove('card--enter');

        if (isMatch && animate) {
            card.style.setProperty('--i', index++); // задержка «лесенкой»
            void card.offsetWidth;                   // перезапускаем анимацию
            card.classList.add('card--enter', 'is-visible');
        }
    });
}

function selectTab(tab, instant) {
    const animate = !instant && !prefersReducedMotion;

    menuTabs.forEach(function (item) {
        const isSelected = item === tab;
        item.setAttribute('aria-selected', String(isSelected));
        item.tabIndex = isSelected ? 0 : -1; // Tab попадает только на выбранную вкладку
    });
    menuPanel.setAttribute('aria-labelledby', tab.id);
    moveIndicator(tab);

    // На телефоне прокручиваем ряд вкладок, чтобы выбранная была видна целиком
    tabList.scrollTo({ left: tab.offsetLeft - 24, behavior: animate ? 'smooth' : 'auto' });

    clearTimeout(switchTimer);
    if (!animate) {
        showCards(tab.dataset.category, false);
        return;
    }

    // Сначала сетка коротко гаснет, потом появляются карточки новой категории
    menuPanel.classList.add('is-switching');
    switchTimer = setTimeout(function () {
        showCards(tab.dataset.category, true);
        menuPanel.classList.remove('is-switching');
    }, 200);
}

menuTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
        if (tab.getAttribute('aria-selected') !== 'true') selectTab(tab);
    });
});

// Управление с клавиатуры: стрелки влево/вправо, Home и End
tabList.addEventListener('keydown', function (event) {
    const tabs = Array.from(menuTabs);
    const current = tabs.indexOf(document.activeElement);
    let next = null;

    if (event.key === 'ArrowRight') next = tabs[(current + 1) % tabs.length];
    if (event.key === 'ArrowLeft') next = tabs[(current - 1 + tabs.length) % tabs.length];
    if (event.key === 'Home') next = tabs[0];
    if (event.key === 'End') next = tabs[tabs.length - 1];
    if (!next || current === -1) return;

    event.preventDefault();
    next.focus();
    selectTab(next);
});

// Подложка следует за вкладкой, если меняются размеры (загрузились шрифты, повернули экран)
function syncIndicator() {
    moveIndicator(document.querySelector('.menu-tab[aria-selected="true"]'));
}
new ResizeObserver(syncIndicator).observe(tabList);
document.fonts.ready.then(syncIndicator);

// Стартовое состояние: категория «Кофе», без анимации
selectTab(document.querySelector('.menu-tab[aria-selected="true"]'), true);
requestAnimationFrame(function () {
    tabList.classList.add('is-ready'); // плавное движение подложки — только после первой отрисовки
});

// ---------- 7. Бронирование столика (демо) ----------
// Форма только проверяет данные и показывает сообщение.
// Ничего не отправляется на сервер и не сохраняется: после закрытия окна поля очищаются.
const booking = document.getElementById('booking');
const bookingForm = document.getElementById('booking-form');
const bookingSummary = document.getElementById('booking-summary');
const bookingFields = {
    name: document.getElementById('bk-name'),
    date: document.getElementById('bk-date'),
    time: document.getElementById('bk-time'),
    guests: document.getElementById('bk-guests')
};
const stepButtons = booking.querySelectorAll('.stepper__btn');

// Часы работы — те же, что в разделе «Контакты». Последняя бронь — за час до закрытия
const OPENING_HOURS = { weekday: [8, 22], weekend: [9, 23] };
const MAX_GUESTS = 8;
const DAYS_AHEAD = 60;

let lastTrigger = null;    // кнопка, которая открыла окно (вернём на неё фокус)
let triedSubmit = false;   // ошибки показываем «на лету» только после первой попытки отправки
let pressedOnBackdrop = false;
let closeTimer = null;

function pad(number) {
    return String(number).padStart(2, '0');
}

// Дата в формате ГГГГ-ММ-ДД по местному времени (такой формат понимает <input type="date">)
function toISODate(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
}

function parseISODate(value) {
    const parts = value.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
}

// Список времени зависит от дня недели; для сегодняшнего дня прошедшее время не показываем
function fillTimeOptions() {
    const select = bookingFields.time;
    const previous = select.value;
    const dateValue = bookingFields.date.value;
    select.innerHTML = '';

    if (!dateValue || dateValue < bookingFields.date.min || dateValue > bookingFields.date.max) {
        select.add(new Option('Сначала дата', ''));
        select.disabled = true;
        return;
    }

    const day = parseISODate(dateValue).getDay();
    const hours = (day === 0 || day === 6) ? OPENING_HOURS.weekend : OPENING_HOURS.weekday;
    const now = new Date();
    const isToday = dateValue === toISODate(now);
    const earliest = now.getHours() * 60 + now.getMinutes() + 30; // сегодня — не раньше чем через 30 минут

    select.add(new Option('Выберите время', ''));
    for (let minutes = hours[0] * 60; minutes <= (hours[1] - 1) * 60; minutes += 30) {
        if (isToday && minutes < earliest) continue;
        const label = pad(Math.floor(minutes / 60)) + ':' + pad(minutes % 60);
        select.add(new Option(label, label));
    }

    if (select.options.length === 1) {
        select.options[0].text = 'На сегодня свободного времени нет';
    }
    select.disabled = select.options.length === 1;
    select.value = previous;
    if (select.value !== previous) select.value = '';
}

function setFieldError(field, message) {
    document.getElementById(field.id + '-error').textContent = message;
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    field.closest('.field').classList.toggle('field--invalid', Boolean(message));
}

// Проверка одного поля. Возвращает true, если всё в порядке
function validateField(name) {
    const field = bookingFields[name];
    const value = field.value.trim();
    let message = '';

    if (name === 'name') {
        if (!value) message = 'Введите имя';
        else if (!/^[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё\s'-]{1,39}$/.test(value)) message = 'Имя — от 2 до 40 букв, без цифр';
    }
    if (name === 'date') {
        if (!value) message = 'Выберите дату';
        else if (value < field.min) message = 'Эта дата уже прошла';
        else if (value > field.max) message = 'Бронируем не дальше чем на ' + DAYS_AHEAD + ' дней вперёд';
    }
    if (name === 'time') {
        if (field.disabled) message = bookingFields.date.value ? 'На выбранную дату нет свободного времени' : 'Сначала выберите дату';
        else if (!value) message = 'Выберите время';
    }
    if (name === 'guests') {
        const guests = Number(value);
        if (!Number.isInteger(guests) || guests < 1 || guests > MAX_GUESTS) {
            message = 'Укажите от 1 до ' + MAX_GUESTS + ' гостей';
        }
    }

    setFieldError(field, message);
    return !message;
}

function updateStepper() {
    const guests = Number(bookingFields.guests.value);
    stepButtons[0].disabled = guests <= 1;
    stepButtons[1].disabled = guests >= MAX_GUESTS;
}

function showBookingView(name) {
    booking.querySelectorAll('.modal__view').forEach(function (view) {
        view.hidden = view.dataset.view !== name;
    });
}

// Полностью очищаем форму: введённые данные нигде не остаются
function resetBooking() {
    bookingForm.reset();
    triedSubmit = false;
    bookingSummary.textContent = '';

    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + DAYS_AHEAD);
    bookingFields.date.min = toISODate(today);
    bookingFields.date.max = toISODate(lastDay);

    Object.keys(bookingFields).forEach(function (name) {
        setFieldError(bookingFields[name], '');
    });
    fillTimeOptions();
    updateStepper();
    showBookingView('form');
}

function openBooking(trigger) {
    clearTimeout(closeTimer);
    booking.classList.remove('is-closing');
    lastTrigger = trigger;
    resetBooking();
    closeMenu(); // если было открыто мобильное меню
    booking.showModal(); // поле «Имя» получает фокус благодаря атрибуту autofocus
    document.documentElement.classList.add('is-locked');
}

// Закрываем с короткой анимацией (без неё — если включено «уменьшить движение»)
function closeBooking() {
    if (!booking.open || booking.classList.contains('is-closing')) return;
    if (prefersReducedMotion) {
        booking.close();
        return;
    }
    booking.classList.add('is-closing');
    closeTimer = setTimeout(function () {
        booking.classList.remove('is-closing');
        booking.close();
    }, 240);
}

// Событие close срабатывает при любом способе закрытия
booking.addEventListener('close', function () {
    document.documentElement.classList.remove('is-locked');
    resetBooking();
    if (lastTrigger) lastTrigger.focus();
});

// Esc: браузер сам закрыл бы окно, но мы закрываем его плавно
booking.addEventListener('cancel', function (event) {
    event.preventDefault();
    closeBooking();
});

// Нажатие за пределами окна (на затемнённый фон). Проверяем и нажатие, и отпускание,
// чтобы окно не закрылось, если человек выделял текст в поле и отпустил кнопку снаружи
booking.addEventListener('pointerdown', function (event) {
    pressedOnBackdrop = event.target === booking;
});
booking.addEventListener('click', function (event) {
    if (pressedOnBackdrop && event.target === booking) closeBooking();
    pressedOnBackdrop = false;
});

document.querySelectorAll('[data-booking-open]').forEach(function (button) {
    button.addEventListener('click', function () {
        openBooking(button);
    });
});

booking.querySelectorAll('[data-booking-close]').forEach(function (button) {
    button.addEventListener('click', closeBooking);
});

// Кнопки «−» и «+» у количества гостей
stepButtons.forEach(function (button) {
    button.addEventListener('click', function () {
        const current = Number(bookingFields.guests.value) || 1;
        const next = Math.min(MAX_GUESTS, Math.max(1, current + Number(button.dataset.step)));
        bookingFields.guests.value = next;
        updateStepper();
        if (triedSubmit) validateField('guests');
    });
});

// После первой попытки отправки ошибки исчезают сразу, как только поле исправлено
Object.keys(bookingFields).forEach(function (name) {
    const field = bookingFields[name];
    field.addEventListener(name === 'time' ? 'change' : 'input', function () {
        if (name === 'date') fillTimeOptions();
        if (name === 'guests') updateStepper();
        if (triedSubmit) {
            validateField(name);
            if (name === 'date') validateField('time');
        }
    });
    // Ошибку в заполненном поле показываем, когда человек уходит из него
    field.addEventListener('blur', function () {
        if (triedSubmit || field.value.trim()) validateField(name);
    });
});

bookingForm.addEventListener('submit', function (event) {
    event.preventDefault(); // ничего никуда не отправляем
    triedSubmit = true;

    const names = Object.keys(bookingFields);
    const results = names.map(validateField);
    const firstInvalid = names.find(function (name, index) { return !results[index]; });
    if (firstInvalid) {
        bookingFields[firstInvalid].focus();
        return;
    }

    // Показываем, что именно было бы забронировано (без имени), и сразу очищаем форму
    const date = parseISODate(bookingFields.date.value);
    bookingSummary.textContent =
        date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'long' }) +
        ' · ' + bookingFields.time.value + ' · гостей: ' + bookingFields.guests.value;
    triedSubmit = false; // чтобы очищенные поля не «загорелись» ошибками при потере фокуса
    bookingForm.reset();

    showBookingView('success');
    document.getElementById('booking-success-title').focus();
});
