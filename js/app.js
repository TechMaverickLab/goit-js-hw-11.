const API_KEY = '39484485-dccfbf14586dc449f78b39dc0';
let currentQuery = '';
let currentPage = 1;  // Додано для пагінації
const gallery = document.querySelector('.gallery');
const searchForm = document.getElementById('search-form');
const searchIcon = document.querySelector('.search-icon');
const loadMoreButton = document.querySelector('.load-more');  // Додано для кнопки завантаження

// Створюємо екземпляр SimpleLightbox тут
const lightbox = new SimpleLightbox('.gallery .photo-card a img');

searchIcon.addEventListener('click', () => {
    gallery.innerHTML = '';
    currentQuery = searchForm.elements.searchQuery.value;
    currentPage = 1;  // Обнуляємо пагінацію
    fetchImages(currentQuery);
});

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    gallery.innerHTML = '';
    currentQuery = event.currentTarget.elements.searchQuery.value;
    currentPage = 1;  // Обнуляємо пагінацію
    fetchImages(currentQuery);
});

// Нескінченний скрол
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        currentPage++;
        fetchImages(currentQuery);
    }
});

async function fetchImages(query) {
    try {
        const response = await axios.get(`https://pixabay.com/api/?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${currentPage}`);
        const images = response.data.hits;
        const totalHits = response.data.totalHits;  // загальна кількість зображень
        
        if (images.length === 0) {
            Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        } else {
            renderImages(images);
            Notiflix.Notify.success(`Hooray! We added ${images.length} images. Total images uploaded: ${gallery.children.length} of ${response.data.totalHits} found free images.`);
        }
        
    } catch (error) {
        console.error('Error fetching images:', error);
    }
}

function renderImages(images) {
    const imageMarkup = images.map(image => `
        <div class="photo-card">
            <a href="${image.largeImageURL}">
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
    
    gallery.insertAdjacentHTML('beforeend', imageMarkup);

    // Прокручування сторінки
    const { height: cardHeight } = document.querySelector(".gallery").firstElementChild.getBoundingClientRect();
    window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
    });

    // Оновлюємо SimpleLightbox
    lightbox.refresh();
}

const scrollToTopBtn = document.getElementById('scrollToTopBtn');

// Функція для прокручування до початку сторінки
scrollToTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Функція, яка визначає, коли кнопка має з'явитися або зникнути
window.addEventListener('scroll', () => {
  // Визначаємо, коли користувач прокрутив сторінку на певну висоту
  const heightToShow = gallery.firstElementChild.getBoundingClientRect().height;

  if (window.scrollY > heightToShow) {
    scrollToTopBtn.style.display = 'block';
  } else {
    scrollToTopBtn.style.display = 'none';
  }
});
