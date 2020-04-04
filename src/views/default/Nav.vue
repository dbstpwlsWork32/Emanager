<template>
  <v-navigation-drawer
    permanent
    app
    width=180px
    id="nav"
  >
    <v-list nav>
      <v-list-item
        link
        to="/"
      >
        <v-list-item-icon>
          <v-icon>mdi-view-dashboard</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item
          link
          to="/favorite"
        >
        <v-list-item-icon>
          <v-icon>mdi-heart</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Favorite</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Header',
  data: () => ({
  })
})
</script>
