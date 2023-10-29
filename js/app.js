import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';

const API_KEY = '39484485-dccfbf14586dc449f78b39dc0';
const BASE_URL = 'https://pixabay.com/api/';
const IMAGE_TYPE = 'photo';
const ORIENTATION = 'horizontal';
const SAFESEARCH = 'true';
const PER_PAGE = 40;

const galleryElement = document.querySelector('.gallery');
const searchFormElement = document.getElementById('search-form');
const searchIconElement = document.querySelector('.search-icon');
const loadMoreButtonElement = document.getElementById('loadMoreBtn');
const scrollToTopButtonElement = document.getElementById('scrollToTopBtn');

let currentQuery = '';
let currentPage = 1;
let lastScrollPosition = 0;
let isScrollingDown = true;
let isAnimating = false;
let animationRequestID = null;
// eslint-disable-next-line no-unused-vars
let isScrollingToTop = false;
// eslint-disable-next-line no-unused-vars
let buttonClicked = false;

searchIconElement.addEventListener('click', () => {
  galleryElement.innerHTML = '';
  currentQuery = searchFormElement.elements.searchQuery.value;
  fetchImages(currentQuery);
});

searchFormElement.addEventListener('submit', (event) => {
  event.preventDefault();
  galleryElement.innerHTML = '';
  currentQuery = event.currentTarget.elements.searchQuery.value;
  fetchImages(currentQuery);
});

async function fetchImages (query, page = 1) {
  const queryParams = new URLSearchParams({
    key: API_KEY,
    q: query,
    image_type: IMAGE_TYPE,
    orientation: ORIENTATION,
    safesearch: SAFESEARCH,
    per_page: PER_PAGE.toString(),
    page: page.toString(),
  });

  const fullUrl = `${BASE_URL}?${queryParams.toString()}`;

  try {
    const response = await axios.get(fullUrl);
    const images = response.data.hits;
    const { totalHits } = response.data;

    if (images.length === 0) {
      Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      loadMoreButtonElement.style.display = 'none';
    } else {
      renderImages(images);
      currentPage = page;
      const successMessage = `Hooray! We found ${totalHits} images. `
  + `Loaded ${images.length} more. `
  + `Total loaded: ${currentPage * PER_PAGE}`;

      Notiflix.Notify.success(successMessage);
      buttonClicked = false;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching images:', error);

    Notiflix.Notify.failure('Something went wrong. Please try again later.');
  }
}

function renderImages (images) {
  const imageMarkup = images.map((image) => `
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
  `).join('');

  galleryElement.insertAdjacentHTML('beforeend', imageMarkup);
  // eslint-disable-next-line no-unused-vars
  const lightbox = new SimpleLightbox('.photo-card a', {});
}

loadMoreButtonElement.addEventListener('click', () => {
  loadMoreButtonElement.style.opacity = '1';

  loadMoreButtonElement.classList.add('spinFast');

  setTimeout(() => {
    loadMoreButtonElement.classList.remove('spinFast');
    loadMoreButtonElement.classList.add('spinBackAndFly');
  }, 500);

  setTimeout(() => {
    fetchImages(currentQuery, currentPage + 1);
    loadMoreButtonElement.classList.remove('spinBackAndFly');
  }, 3500);
});

loadMoreButtonElement.addEventListener('mouseenter', () => {
  loadMoreButtonElement.style.opacity = '1';
  loadMoreButtonElement.classList.add('bounce');
});

loadMoreButtonElement.addEventListener('mouseleave', () => {
  loadMoreButtonElement.classList.remove('bounce');
});

scrollToTopButtonElement.addEventListener('click', () => {
  isScrollingToTop = true;
  scrollToTopButtonElement.classList.add('flyOut');

  setTimeout(() => {
    smoothScrollToTop(4000);
    scrollToTopButtonElement.classList.remove('flyOut');
  }, 2000);
});

function smoothScrollToTop (duration) {
  const targetPosition = 0;
  const startPosition = window.pageYOffset;
  let startTime = null;

  function animation (currentTime) {
    if (startTime === null) {
      startTime = currentTime;
    }

    const timeElapsed = currentTime - startTime;
    const run = ease(timeElapsed, startPosition, targetPosition - startPosition, duration);

    window.scrollTo(0, run);
    if (timeElapsed < duration) {
      animationRequestID = requestAnimationFrame(animation);
    } else {
      isScrollingToTop = false;
      isAnimating = false;
    }
  }

  window.addEventListener('wheel', stopSmoothScrolling);
  window.addEventListener('touchmove', stopSmoothScrolling);
  window.addEventListener('keydown', handleKeyScrolling);

  isAnimating = true;
  animationRequestID = requestAnimationFrame(animation);
}

function stopSmoothScrolling () {
  if (isAnimating && animationRequestID) {
    cancelAnimationFrame(animationRequestID);
    animationRequestID = null;
    isAnimating = false;
    window.removeEventListener('wheel', stopSmoothScrolling);
    window.removeEventListener('touchmove', stopSmoothScrolling);
    window.removeEventListener('keydown', handleKeyScrolling);
  }
}

function handleKeyScrolling (event) {
  if (event.keyCode === 38 || event.keyCode === 40) {
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
  const firstImage = galleryElement.querySelector('img');
  const currentScrollPosition = window.scrollY;

  if (currentScrollPosition > lastScrollPosition) {
    isScrollingDown = true;
  } else {
    isScrollingDown = false;
  }

  lastScrollPosition = currentScrollPosition;

  if (!firstImage) return;

  const imagePosition = firstImage.getBoundingClientRect().top;

  if (currentScrollPosition === 0) {
    scrollToTopButtonElement.style.display = 'none';
    scrollToTopButtonElement.classList.remove('half-opacity');
  } else if (imagePosition < 0) {
    scrollToTopButtonElement.style.display = 'block';
    if (!isScrollingDown) {
      scrollToTopButtonElement.classList.add('half-opacity');
    } else {
      scrollToTopButtonElement.classList.remove('half-opacity');
    }
  } else {
    scrollToTopButtonElement.style.display = 'none';
    scrollToTopButtonElement.classList.remove('half-opacity');
  }

  const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 10;

  if (nearBottom) {
    loadMoreButtonElement.style.display = 'block';
    loadMoreButtonElement.focus();
    loadMoreButtonElement.style.border = 'none';
  } else if (!isScrollingDown && window.scrollY < document.body.offsetHeight - 100) {
    loadMoreButtonElement.style.display = 'none';
  }

  const lastImage = galleryElement.lastElementChild;
  if (lastImage) {
    const rect = lastImage.getBoundingClientRect();
    if (rect.bottom > window.innerHeight - 72) {
      loadMoreButtonElement.style.bottom = '10px';
    } else {
      loadMoreButtonElement.style.bottom = '40px';
    }
  }
});
