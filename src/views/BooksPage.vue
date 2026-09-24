<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          label="Pretraži knjige"
          append-icon="mdi-magnify"
          clearable
          @input="onSearchInput"
        />
      </v-col>

      <v-col cols="12" md="4">
        <v-select
          :items="authors"
          v-model="selectedAuthor"
          label="Filtriraj po autoru"
          clearable
          @change="onFilterChange"
        />
      </v-col>

      <v-col cols="12" md="4" class="text-right">
        <v-btn color="primary" @click="openDialog()">Dodaj knjigu</v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="book in pagedBooks"
        :key="book.id || book.key || book.title"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <book-card :book="book" @edit="openDialog" @delete="deleteBook" />
      </v-col>
    </v-row>

    <v-row justify="center" class="my-4">
      <v-col cols="auto">
        <v-pagination
          v-model="page"
          :length="totalPages"
          @input="onPageChange"
          circle
        />
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ editedBook.id ? 'Uredi knjigu' : 'Dodaj knjigu' }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-text-field
              v-model="editedBook.title"
              label="Naslov"
              :rules="[v => !!v || 'Naslov je obavezan']"
              required
            />
            <v-text-field
              v-model="editedBook.author"
              label="Autor"
              :rules="[v => !!v || 'Autor je obavezan']"
              required
            />
            <v-text-field
              v-model.number="editedBook.year"
              label="Godina"
              type="number"
              :rules="[v => !v || (v > 0) || 'Godina mora biti pozitivan broj']"
            />
            <v-text-field
              v-model="editedBook.cover_url"
              label="URL slike"
              placeholder="https://example.com/cover.jpg"
            />
            <v-textarea
              v-model="editedBook.description"
              label="Opis"
              rows="3"
            />
            <v-img
              v-if="editedBook.cover_url && editedBook.cover_url.trim() !== ''"
              :src="editedBook.cover_url"
              max-height="200"
              contain
              class="mt-3"
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog">Odustani</v-btn>
          <v-btn :disabled="!valid" color="primary" @click="saveBook">
            Spremi
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" top>
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script>
import BookCard from '@/components/BookCard.vue';
import booksApi from '@/services/booksApi';

export default {
  name: 'BooksPage',
  components: { BookCard },
  data() {
    return {
      allBooks: [],          // svi podaci dohvaćeni s backend
      pagedBooks: [],        // prikaz trenutne stranice s filterom
      authors: [],
      selectedAuthor: null,
      search: '',
      page: 1,
      itemsPerPage: 8,
      totalPages: 1,
      dialog: false,
      valid: false,
      editedBook: {
        id: null,
        title: '',
        author: '',
        description: '',
        cover_url: '',
        year: null
      },
      snackbar: false,
      snackbarText: '',
      snackbarColor: 'success',
      loading: false,
      searchDebounceTimer: null
    };
  },
  methods: {
    async mountedFetch() {
      this.loading = true;
      try {
        const res = await booksApi.getAll();
        this.allBooks = Array.isArray(res.data) ? res.data : [];

        // Izvući autore
        const set = new Set();
        this.allBooks.forEach(b => {
          if (b.author) set.add(b.author);
        });
        this.authors = Array.from(set).sort();

        // Primijeni filter i paginaciju odmah
        this.applyFilters();
      } catch (e) {
        console.error('Greška pri učitavanju knjiga/autora:', e);
        this.showSnackbar('Greška pri dohvaćanju knjiga', 'error');
      } finally {
        this.loading = false;
      }
    },

    applyFilters() {
      let filtered = this.allBooks;

      // Filter po naslovu (search)
      if (this.search && this.search.trim() !== '') {
        const searchLower = this.search.trim().toLowerCase();
        filtered = filtered.filter(book => book.title.toLowerCase().includes(searchLower));
      }

      // Filter po autoru
      if (this.selectedAuthor) {
        filtered = filtered.filter(book => book.author === this.selectedAuthor);
      }

      this.totalPages = Math.max(1, Math.ceil(filtered.length / this.itemsPerPage));
      if (this.page > this.totalPages) this.page = this.totalPages;

      // Paginate
      const start = (this.page - 1) * this.itemsPerPage;
      this.pagedBooks = filtered.slice(start, start + this.itemsPerPage);
    },

    onSearchInput() {
      this.page = 1;
      if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = setTimeout(() => {
        this.applyFilters();
      }, 400);
    },

    onFilterChange() {
      this.page = 1;
      this.applyFilters();
    },

    onPageChange() {
      this.applyFilters();
    },

    openDialog(book = null) {
      if (book) {
        this.editedBook = {
          id: book.id || book.key || null,
          title: book.title || '',
          author: book.author || book.author_name?.join?.(', ') || '',
          description: book.description || book.first_sentence || '',
          cover_url: book.cover_url || (book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : ''),
          year: book.year || book.first_publish_year || null
        };
      } else {
        this.editedBook = { id: null, title: '', author: '', description: '', cover_url: '', year: null };
      }
      this.dialog = true;
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetValidation();
      });
    },

    closeDialog() {
      this.dialog = false;
      if (this.$refs.form) this.$refs.form.resetValidation();
    },

    async saveBook() {
      if (!this.valid) return;
      try {
        if (this.editedBook.id) {
          await booksApi.updateBook(this.editedBook.id, this.editedBook);
          this.showSnackbar('Knjiga uspješno uređena', 'success');
        } else {
          await booksApi.addBook(this.editedBook);
          this.showSnackbar('Knjiga uspješno dodana', 'success');
        }
        await this.mountedFetch();
        this.dialog = false;
      } catch (err) {
        console.error('saveBook error', err);
        this.showSnackbar('Greška pri spremanju knjige', 'error');
      }
    },

    async deleteBook(id) {
      if (!confirm('Jeste li sigurni da želite obrisati ovu knjigu?')) return;
      try {
        await booksApi.deleteBook(id);
        this.showSnackbar('Knjiga obrisana', 'success');
        await this.mountedFetch();
      } catch (err) {
        console.error('deleteBook error', err);
        this.showSnackbar('Greška pri brisanju knjige', 'error');
      }
    },

    showSnackbar(message, color = 'success') {
      this.snackbarText = message;
      this.snackbarColor = color;
      this.snackbar = true;
    }
  },

  mounted() {
    this.mountedFetch();
  }
};
</script>
