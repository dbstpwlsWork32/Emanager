<template>
  <v-list nav>
    <v-list-item
      v-for="(item, i) in items"
      :key=i
      link
    >
      <v-list-item-icon>
        <v-icon>{{item.icon}}</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>{{item.text}}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Header',
  data: () => ({
    items: [
      {
        icon: 'mdi-view-dashboard',
        text: 'Home'
      },
      {
        icon: 'mdi-panorama',
        text: 'Picture'
      },
      {
        icon: 'mdi-video',
        text: 'Video'
      },
      {
        icon: 'mdi-file',
        text: 'Others'
      }
    ]
  })
})
</script>
