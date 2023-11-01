/* global axios */

const API_KEY = '39484485-dccfbf14586dc449f78b39dc0';
const BASE_URL = 'https://pixabay.com/api/';
const IMAGE_TYPE = 'photo';
const ORIENTATION = 'horizontal';
const SAFESEARCH = 'true';
const PER_PAGE = 40;

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
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching images:', error);
    throw error;
  }
}

export default fetchImages;
