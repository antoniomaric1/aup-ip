<template>
  <v-card class="mx-auto" outlined>
    <v-img
      v-if="coverUrl"
      :src="coverUrl"
      height="180"
      contain
      @error="onError"
    />
    <v-card-title>{{ book.title }}</v-card-title>
    <v-card-subtitle v-if="book.author">{{ book.author }}</v-card-subtitle>

    <v-card-text>
      <div v-if="book.year"><strong>Godina:</strong> {{ book.year }}</div>
      <div v-if="shortDesc">{{ shortDesc }}</div>
    </v-card-text>

    <v-card-actions>
      <v-btn text small color="primary" @click="$emit('edit', book)">Uredi</v-btn>
      <v-spacer></v-spacer>
      <v-btn icon small color="red" @click="$emit('delete', book.id)" v-if="book.id">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'BookCard',
  props: {
    book: { type: Object, required: true }
  },
  computed: {
    coverUrl() {
      if (!this.book) return null;
      if (this.book.cover_url) return this.book.cover_url;
      if (this.book.cover_i) return `https://covers.openlibrary.org/b/id/${this.book.cover_i}-M.jpg`;
      return null;
    },
    shortDesc() {
      const d = this.book.description || this.book.first_sentence || '';
      if (!d) return '';
      return d.length > 120 ? d.slice(0, 120) + '…' : d;
    }
  },
  methods: {
    onError(e) {
      e.target.src = '';
    }
  }
};
</script>
