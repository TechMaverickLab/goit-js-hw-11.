/* eslint-disable no-unused-vars */
/* global axios, Notiflix, SimpleLightbox */

const API_KEY = '39484485-dccfbf14586dc449f78b39dc0';

let currentQuery = '';
let currentPage = 1;
let lastScrollPosition = 0;
let buttonClicked = false;
let isScrollingDown = true;
let isAnimating = false;

const gallery = document.querySelector('.gallery');
const searchForm = document.getElementById('search-form');
const searchIcon = document.querySelector('.search-icon');

searchIcon.addEventListener('click', () => {
  gallery.innerHTML = '';
  currentQuery = searchForm.elements.searchQuery.value;
  fetchImages(currentQuery);
});

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  gallery.innerHTML = '';
  currentQuery = event.currentTarget.elements.searchQuery.value;
  fetchImages(currentQuery);
});

const loadMoreBtn = document.getElementById('loadMoreBtn');
loadMoreBtn.addEventListener('click', () => {
  buttonClicked = true;
  fetchImages(currentQuery, currentPage + 1);
});

loadMoreBtn.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.keyCode === 13) {
    buttonClicked = true;
    fetchImages(currentQuery, currentPage + 1);
  }
});

let isScrollingToTop = false;

const scrollToTopBtn = document.getElementById('scrollToTopBtn');
scrollToTopBtn.addEventListener('click', () => {
  isScrollingToTop = true;
  smoothScrollToTop(4000);
});

async function fetchImages (query, page = 1) {
  const baseUrl = 'https://pixabay.com/api/';
  const queryParams = `?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal`;
  const safeParams = '&safesearch=true&per_page=40';
  const pageParam = `&page=${page}`;

  const fullUrl = baseUrl + queryParams + safeParams + pageParam;

  try {
    const response = await axios.get(fullUrl);
    const images = response.data.hits;
    const { totalHits } = response.data; // загальна кількість знайдених зображень

    if (images.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.',
      );
      loadMoreBtn.style.display = 'none';
      loadMoreBtn.classList.remove('blinking'); // Додайте цей рядок
    } else {
      renderImages(images);
      currentPage = page;
      // Показуємо повідомлення про успіх
      const successMessage = `Hooray! We found ${totalHits} images. Loaded ${images.length} more.`
                       + ` Total loaded: ${currentPage * 40}`;
      Notiflix.Notify.success(successMessage);

      if (images.length < 40 || currentPage * 40 >= response.data.totalHits) {
        loadMoreBtn.style.display = 'none';
        loadMoreBtn.classList.remove('blinking'); // Додайте цей рядок
      }
      buttonClicked = false; // Скидуємо прапорець після завантаження
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching images:', error);
  }
}

function renderImages (images) {
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

  gallery.insertAdjacentHTML('beforeend', imageMarkup);
  // eslint-disable-next-line no-new
  new SimpleLightbox('.photo-card a', {});
}
let animationRequestID = null;

function smoothScrollToTop (duration) {
  const targetPosition = 0;
  const startPosition = window.pageYOffset;
  let startTime = null;

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

    window.scrollTo(0, run);

    if (timeElapsed < duration) {
      animationRequestID = requestAnimationFrame(animation);
    } else {
      isScrollingToTop = false;
      isAnimating = false; // Reset the value when the animation is complete
    }
  }

  // Listen for scroll event to stop the animation
  window.addEventListener('wheel', stopSmoothScrolling);
  window.addEventListener('touchmove', stopSmoothScrolling);
  window.addEventListener('keydown', handleKeyScrolling);

  isAnimating = true; // Змініть isAnimating на true тут
  animationRequestID = requestAnimationFrame(animation);
}

function stopSmoothScrolling () {
  if (isAnimating && animationRequestID) {
    cancelAnimationFrame(animationRequestID);
    animationRequestID = null;
    isAnimating = false;

    window.removeEventListener('wheel', stopSmoothScrolling);
    window.removeEventListener('touchmove', stopSmoothScrolling);
    window.removeEventListener('keydown', handleKeyScrolling); // Додайте цей рядок
  }
}

function handleKeyScrolling (event) {
  if (event.keyCode === 38 || event.keyCode === 40) { // 38 is arrow up, 40 is arrow down
    stopSmoothScrolling();
  }
}

function ease (t, b, c, d) {
  t /= d / 2;
  if (t < 1) {
    return (c / 2) * t * t + b;
  }
  t--;
  return (-c / 2) * (t * (t - 2) - 1) + b;
}

window.addEventListener('scroll', () => {
  const firstImage = gallery.querySelector('img'); // знаходимо перше зображення
  const currentScrollPosition = window.scrollY;

  // Визначення напрямку прокрутки
  if (currentScrollPosition > lastScrollPosition) {
    isScrollingDown = true;
  } else {
    isScrollingDown = false;
  }

  lastScrollPosition = currentScrollPosition; // Оновлення позиції прокрутки

  if (!firstImage) return; // якщо зображення немає, нічого не робимо

  const imagePosition = firstImage.getBoundingClientRect().top;

  if (imagePosition < 0) {
    // Показати кнопку "Повернутися до верху"
    scrollToTopBtn.style.display = 'block';
  } else {
    // Скрити кнопку "Повернутися до верху"
    scrollToTopBtn.style.display = 'none';
  }

  // Перевірка, чи користувач досяг кінця сторінки для показу кнопки дозавантаження
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
    loadMoreBtn.style.display = 'block';
    loadMoreBtn.classList.add('blinking');
    loadMoreBtn.focus();
  } else {
    if (!isScrollingDown) {
      loadMoreBtn.style.display = 'none';
      loadMoreBtn.classList.remove('blinking');
    }

    // перевірте, чи іконка перекриває зображення
    const lastImage = gallery.lastElementChild; // отримайте останнє зображення
    if (lastImage) {
      const rect = lastImage.getBoundingClientRect();
      if (rect.bottom > window.innerHeight - 72) { // 72 = висота іконки + 40px відстань
        loadMoreBtn.style.bottom = '10px'; // мінімальний відступ від низу
      } else {
        loadMoreBtn.style.bottom = '40px'; // звичайний відступ від низу
      }
    }
  }
});
