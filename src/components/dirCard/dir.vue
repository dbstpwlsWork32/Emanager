<template>
  <v-card
    :loading="isLoading"
    :disabled="isLoading"
    link
    :to="'/'+id"
  >
    <v-list-item three-line>
      <v-list-item-content>
        <div
          class="overline mb-4"
          v-if="process !== ''"
        >{{process}}</div>
        <v-list-item-title>{{name}}</v-list-item-title>
        <v-list-item-subtitle>{{nowPath}}</v-list-item-subtitle>
        <v-rating
          v-if="rate.show"
          :value="rate.count"
          color="amber"
          dense
          half-increments
          readonly
          size="14"
        ></v-rating>
      </v-list-item-content>
    </v-list-item>

    <v-divider class="mx-4"></v-divider>

    <v-card-actions>
      <v-tooltip
        v-for="(type, index) in overall"
        :key="index"
        top
      >
        <template
          v-slot:activator="{ on }"
          v-if="type.type === `picture`"
        >
          <v-icon v-on="on">mdi-image</v-icon>
        </template>
        <template
          v-slot:activator="{ on }"
          v-else-if="type.type === `video`"
        >
          <v-icon v-on="on">mdi-video</v-icon>
        </template>
        <template
          v-slot:activator="{ on }"
          v-else-if="type.type === `game`"
        >
          <v-icon v-on="on">mdi-gamepad-variant</v-icon>
        </template>
        <span>{{type.count}}</span>
      </v-tooltip>
    </v-card-actions>
  </v-card>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'come__oneDirectory',
  props: {
    isLoading: {
      type: Boolean,
      default: function () {
        return false
      }
    },
    nowPath: {
      type: String,
      required: true
    },
    name: {
      type: String
    },
    process: {
      type: String,
      default: function () {
        return ''
      }
    },
    overall: {
      type: Array,
      required: true
    },
    id: {
      type: String,
      required: true
    },
    dir: {},
    rate: {
      show: Boolean,
      count: Number,
      default: function () {
        return { show: true, count: 0 }
      }
    }
  }
})
</script>

<style lang="sass">
  @import './index'
</style>
