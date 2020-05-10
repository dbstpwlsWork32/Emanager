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
        v-for="(item, i) in defaultNav"
        :key="i"
        :to="item.path"
      >
        <v-list-item-icon>
          <v-icon>{{item.icon}}</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{item.text}}</v-list-item-title>
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
    defaultNav: [
      {
        icon: 'mdi-view-dashboard',
        text: 'Home',
        path: '/'
      },
      {
        icon: 'mdi-heart',
        text: 'Favorite',
        path: '/favorite'
      },
      {
        icon: 'mdi-folder-clock',
        text: 'Current',
        path: '/current'
      }
    ]
  })
})
</script>
