<template>
  <v-alert
    type="success"
    dismissible
    @input="$emit('input', '')"
  >
    {{ message }}
  </v-alert>
</template>

<script>
export default {
  props: ['message'],
};
</script>
