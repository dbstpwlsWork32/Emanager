<template>
  <v-list nav dense>
    <v-list-item
      v-for="(item, i) in items"
      :key=i
      link
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
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Header',
  data: () => ({
    items: [
      {
        icon: 'mdi-view-dashboard',
        text: 'Home',
        path: '/'
      },
      {
        icon: 'mdi-panorama',
        text: 'Picture',
        path: '/picture'
      },
      {
        icon: 'mdi-video',
        text: 'Video',
        path: '/video'
      },
      {
        icon: 'mdi-file',
        text: 'Others',
        path: '/others'
      }
    ]
  })
})
</script>
