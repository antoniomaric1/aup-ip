<template>
  <v-container class="landing-container text-center my-12" fluid>
    <v-row justify="center" align="center">
      <v-col cols="12" md="8" class="content-overlay">
        <h1>Dobrodošli u Knjižnicu</h1>
        <v-img
          src="https://cdn.pixabay.com/photo/2017/08/01/00/31/books-2565594_960_720.jpg"
          alt="Ilustracija knjiga"
          max-width="400"
          class="mx-auto my-4"
          contain
        />
        <p class="subtitle-1">
          Ova web aplikacija osmišljena je od studenta Antonia Marića kako bi vam omogućila jednostavan pristup širokoj kolekciji knjiga.
          Izgrađena je korištenjem najnovijih tehnologija poput <strong>Vue.js</strong> i <strong>Vuetify</strong>, 
          uz integraciju <strong>Open Library API-ja</strong> za pristup različitim knjigama.
        </p>
        <p class="subtitle-1">
          Pregledajte, pretražujte i filtrirajte knjige po naslovima ili autorima. 
          Dodajte nove naslove ili uredite postojeće – sve na jednom mjestu, intuitivno i responzivno.
        </p>
        <p class="subtitle-1">
          Digitalna Knjižnica idealna je za studente, nastavnike, ali i sve ljubitelje knjiga.
        </p>
        <v-btn color="primary" large @click="$router.push('/books')">Istraži Knjige</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {};
</script>

<style scoped>
.landing-container {
  /* pozadinska slika na cijeli container */
  background-image: url('https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1470&q=80');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

/* poluprozirni overlay za bolju čitljivost teksta */
.landing-container::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 0;
}

/* sadržaj mora biti iznad overlay */
.content-overlay {
  position: relative;
  z-index: 1;
}
</style>
