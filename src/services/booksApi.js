import axios from 'axios';

const API_URL = 'http://localhost:3000/api/knjige';

export default {
  getAll() {
    return axios.get(API_URL); // vraća sve knjige (koristimo za listu autora)
  },
  getByPage(page = 1) {
    return axios.get(`${API_URL}/page/${page}`); // server-side page
  },
  search(query) {
    return axios.get(`${API_URL}/search/${encodeURIComponent(query)}`); // vraća niz rezultata (bez paginacije)
  },
  addBook(book) {
    return axios.post(API_URL, book);
  },
  updateBook(id, book) {
    return axios.put(`${API_URL}/${id}`, book);
  },
  deleteBook(id) {
    return axios.delete(`${API_URL}/${id}`);
  }
};
