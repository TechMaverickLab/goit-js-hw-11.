/* eslint-disable no-unused-vars */

// ============================================================================================================
//                                    ГЛОБАЛЬНІ ЗМІННІ І КОНСТАНТИ
// ============================================================================================================

// Глобальні змінні для зовнішніх бібліотек
/* global axios, Notiflix, SimpleLightbox */

// Ключ API для доступу до сервісу зображень Pixabay
const API_KEY = '39484485-dccfbf14586dc449f78b39dc0';

// Змінні для стану додатку
let currentQuery = '';
let currentPage = 1;
let lastScrollPosition = 0;
let buttonClicked = false;
let isScrollingDown = true;
let isAnimating = false;
let animationRequestID = null;// Змінна для ID запиту анімації
let isScrollingToTop = false; // Змінна, яка вказує, чи прокручується сторінка до верху

// Отримання елементів DOM
const gallery = document.querySelector('.gallery');
const searchForm = document.getElementById('search-form');
const searchIcon = document.querySelector('.search-icon');
const loadMoreBtn = document.getElementById('loadMoreBtn'); // Елемент кнопки "Додати ще"
const scrollToTopBtn = document.getElementById('scrollToTopBtn');// Елемент кнопки "Прокрутити до верху"
const isHovered = false; // Змінна для відстеження наведення курсора

// ============================================================================================================
//                                  ЗАВАНТАЖЕННЯ ЗОБРАЖЕНЬ
// ============================================================================================================

// Обробник подій для кліку по іконці пошуку
searchIcon.addEventListener('click', () => {
  gallery.innerHTML = ''; // Очистка галереї
  currentQuery = searchForm.elements.searchQuery.value; // Оновлення пошукового запиту
  fetchImages(currentQuery); // Запит на отримання зображень
});

// Обробник подій для відправки форми
searchForm.addEventListener('submit', (event) => {
  event.preventDefault(); // Запобігання стандартній поведінці форми
  gallery.innerHTML = ''; // Очистка галереї
  currentQuery = event.currentTarget.elements.searchQuery.value; // Оновлення пошукового запиту
  fetchImages(currentQuery); // Запит на отримання зображень
});

// Асинхронна функція для запиту зображень
async function fetchImages (query, page = 1) {
  // Створення URL для запиту
  const baseUrl = 'https://pixabay.com/api/';
  const queryParams = `?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal`;
  const safeParams = '&safesearch=true&per_page=40';
  const pageParam = `&page=${page}`;
  const fullUrl = baseUrl + queryParams + safeParams + pageParam;

  try {
    const response = await axios.get(fullUrl); // Виконання запиту до API
    const images = response.data.hits; // Отримання списку зображень
    const { totalHits } = response.data; // Отримання загальної кількості знайдених зображень

    // Обробка отриманих результатів
    if (images.length === 0) {
      // Якщо зображень не знайдено, показати повідомлення про помилку
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.',
      );
      loadMoreBtn.style.display = 'none'; // Приховати кнопку "Додати ще"
    } else {
      // Якщо зображення знайдено, відобразити їх
      renderImages(images);
      currentPage = page; // Оновити поточну сторінку
      // Показати повідомлення про успішне завантаження зображень
      const successMessage = `Hooray! We found ${totalHits} images. Loaded ${images.length} more.`
                       + ` Total loaded: ${currentPage * 40}`;
      Notiflix.Notify.success(successMessage);

      buttonClicked = false; // Скидання стану кнопки після завантаження зображень
    }
  } catch (error) {
    // Обробка помилок запиту
    // console.error('Error fetching images:', error);
  }
}

// Функція для відображення зображень в галереї
function renderImages (images) {
  // Створення розмітки для кожного зображення
  const imageMarkup = images
    .map(
      (image) => `
    <div class="photo-card">  
      <a href="${image.largeImageURL}" data-lightbox="gallery">  
        <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />  
      </a>
      <div class="info">  
        <p class="info-item"><b>Likes:</b> ${image.likes}</p>  
        <p class="info-item"><b>Views:</b> ${image.views}</p>  
        <p class="info-item"><b>Comments:</b> ${image.comments}</p>  
        <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>  
      </div>
    </div>
  `,
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', imageMarkup); // Додавання розмітки до галереї
  // eslint-disable-next-line no-new
  new SimpleLightbox('.photo-card a', {}); // Ініціалізація плагіна для перегляду зображень
}

// ============================================================================================================
//                                  ДОЗАВАНТАЖЕННЯ ЗОБРАЖЕНЬ
// ============================================================================================================

// Обробник подій для кліку по кнопці "Додати ще"
loadMoreBtn.addEventListener('click', () => {
  // Зробити кнопку повністю видимою
  loadMoreBtn.style.opacity = 1;
  // Додати анімацію швидкого обертання
  loadMoreBtn.classList.add('spinFast');

  setTimeout(() => {
    // Видалити анімацію швидкого обертання
    loadMoreBtn.classList.remove('spinFast');
    // Додати анімацію обертання назад і вилітання кнопки
    loadMoreBtn.classList.add('spinBackAndFly');
  }, 500);

  setTimeout(() => {
    // Функція, яка відповідає за дозавантаження нових фотографій
    fetchImages(currentQuery, currentPage + 1); // Дозавантаження фото після вильоту кнопки
    loadMoreBtn.classList.remove('spinBackAndFly'); // Видалення класу для анімації вильоту
  }, 3500); // Чекаємо, поки анімація завершиться
});

// ============================================================================================================
//                                  КНОПКА ДОЗАВАНТАЖЕННЯ
// ============================================================================================================

// Обробник подій для наведення курсора миші на кнопку "Додати ще"
loadMoreBtn.addEventListener('mouseenter', () => {
  loadMoreBtn.style.opacity = 1;// Зробити кнопку повністю видимою
  // Додати анімацію "bounce"
  loadMoreBtn.classList.add('bounce');
});

// Обробник подій для виходу курсора миші з кнопки "Додати ще"
loadMoreBtn.addEventListener('mouseleave', () => {
  loadMoreBtn.classList.remove('bounce'); // Видалення класу для анімації
});

// ============================================================================================================
//                                  КНОПКА ПОВЕРНЕННЯ ДО ГОРИ
// ============================================================================================================

// Обробник подій для кліку по кнопці "Прокрутити до верху"
scrollToTopBtn.addEventListener('click', () => {
  isScrollingToTop = true; // Встановлення стану прокрутки як "до верху"
  scrollToTopBtn.classList.add('flyOut'); // Застосування анімації "Вилітіти"
  setTimeout(() => {
    smoothScrollToTop(4000); // Плавна прокрутка до верху протягом 4 секунд
    scrollToTopBtn.classList.remove('flyOut'); // Видалення анімації "Вилітіти"
  }, 2000); // Затримка в 2 секунди перед початком прокрутки
});

// Функція для плавної прокрутки до верху сторінки
function smoothScrollToTop (duration) {
  // Початкові параметри для анімації
  const targetPosition = 0;
  const startPosition = window.pageYOffset;
  let startTime = null;

  // Основна функція анімації
  function animation (currentTime) {
    if (startTime === null) {
      startTime = currentTime;
    }

    const timeElapsed = currentTime - startTime;
    const run = ease(
      timeElapsed,
      startPosition,
      targetPosition - startPosition,
      duration,
    );

    window.scrollTo(0, run); // Прокрутка до певної позиції

    // Продовження анімації, поки не закінчиться час
    if (timeElapsed < duration) {
      animationRequestID = requestAnimationFrame(animation);
    } else {
      isScrollingToTop = false; // Скидання стану прокрутки
      isAnimating = false; // Скидання стану анімації
    }
  }

  // Слухачі подій для зупинки анімації при ручній прокрутці
  window.addEventListener('wheel', stopSmoothScrolling);
  window.addEventListener('touchmove', stopSmoothScrolling);
  window.addEventListener('keydown', handleKeyScrolling);

  isAnimating = true; // Установка стану анімації
  animationRequestID = requestAnimationFrame(animation); // Початок анімації
}

// Функція для зупинки плавної прокрутки
function stopSmoothScrolling () {
  if (isAnimating && animationRequestID) {
    cancelAnimationFrame(animationRequestID); // Відміна запиту анімації
    animationRequestID = null;
    isAnimating = false; // Скидання стану анімації

    // Видалення слухачів подій
    window.removeEventListener('wheel', stopSmoothScrolling);
    window.removeEventListener('touchmove', stopSmoothScrolling);
    window.removeEventListener('keydown', handleKeyScrolling);
  }
}

// Функція для обробки натискання клавіш при плавній прокрутці
function handleKeyScrolling (event) {
  // Якщо натиснута стрілка вгору або вниз, зупинити плавну прокрутку
  if (event.keyCode === 38 || event.keyCode === 40) {
    stopSmoothScrolling();
  }
}

// Функція для створення анімації плавної зміни позиції прокрутки
function ease (t, b, c, d) {
  t /= d / 2;
  if (t < 1) {
    return (c / 2) * t * t + b;
  }
  t--;
  return (-c / 2) * (t * (t - 2) - 1) + b;
}

// ============================================================================================================
//                                  ІНШЕ
// ============================================================================================================

// Слухач подій для слідкування за змінами позиції прокрутки сторінки
window.addEventListener('scroll', () => {
  // Отримання першого зображення в галереї
  const firstImage = gallery.querySelector('img');
  // Отримання поточної позиції прокрутки
  const currentScrollPosition = window.scrollY;

  // Визначення напрямку прокрутки: вниз або вгору
  if (currentScrollPosition > lastScrollPosition) {
    isScrollingDown = true;
  } else {
    isScrollingDown = false;
  }

  // Зберігання поточної позиції прокрутки для майбутнього порівняння
  lastScrollPosition = currentScrollPosition;

  // Якщо в галереї немає жодного зображення, вийти з функції
  if (!firstImage) return;

  // Отримання позиції першого зображення відносно верхнього краю вікна браузера
  const imagePosition = firstImage.getBoundingClientRect().top;

  // Логіка для показу або приховування кнопки "Прокрутити до верху"
  if (currentScrollPosition === 0) {
    // Якщо користувач на верху сторінки, приховати кнопку
    scrollToTopBtn.style.display = 'none';
    scrollToTopBtn.classList.remove('half-opacity');
  } else if (imagePosition < 0) {
    // Якщо користувач прокрутив нижче першого зображення, показати кнопку
    scrollToTopBtn.style.display = 'block';
    // Зміна прозорості кнопки в залежності від напрямку прокрутки
    if (!isScrollingDown) {
      scrollToTopBtn.classList.add('half-opacity');
    } else {
      scrollToTopBtn.classList.remove('half-opacity');
    }
  } else {
    // Якщо користувач знаходиться вище першого зображення, приховати кнопку
    scrollToTopBtn.style.display = 'none';
    scrollToTopBtn.classList.remove('half-opacity');
  }

  // Логіка для відображення кнопки "Додати ще" коли користувач досягає кінця сторінки
  const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 10;

  if (nearBottom) {
    loadMoreBtn.style.display = 'block';

    loadMoreBtn.focus();
    loadMoreBtn.style.border = 'none';
  } else if (!isScrollingDown && window.scrollY < document.body.offsetHeight - 100) {
    loadMoreBtn.style.display = 'none';
  }

  // Перевірка, чи кнопка "Додати ще" перекриває останнє зображення в галереї
  const lastImage = gallery.lastElementChild;
  if (lastImage) {
    const rect = lastImage.getBoundingClientRect();
    if (rect.bottom > window.innerHeight - 72) {
      loadMoreBtn.style.bottom = '10px'; // Перемістити кнопку вище
    } else {
      loadMoreBtn.style.bottom = '40px'; // Залишити кнопку на звичайному місці
    }
  }
});
