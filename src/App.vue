<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Knjižnica</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text to="/">Početna</v-btn>
      <v-btn text to="/books">Knjige</v-btn>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
    <v-footer app padless>
      <v-col class="text-center" cols="12">
        &copy; 2026 Antonio Maric
      </v-col>
    </v-footer>
  </v-app>
</template>

<script>
export default {};
</script>
