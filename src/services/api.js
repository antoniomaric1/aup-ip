// src/services/api.js
import axios from 'axios';

const BASE_URL = 'https://openlibrary.org';

export default {
  searchBooks(query, page = 1) {
    return axios.get(`${BASE_URL}/search.json?q=${encodeURIComponent(query)}&page=${page}`);
  },
  getBookDetails(workId) {
    return axios.get(`${BASE_URL}/works/${workId}.json`);
  },
  getAuthor(authorId) {
    return axios.get(`${BASE_URL}/authors/${authorId}.json`);
  }
};
