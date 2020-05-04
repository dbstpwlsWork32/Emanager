<template>
  <v-content id="body">
    <v-container
      fluid
    >
      <router-view></router-view>
    </v-container>
  </v-content>
</template>

<script>
import Vue from 'vue'
import DataStore from 'nedb'
import path from 'path'
import { remote } from 'electron'

export default Vue.extend({
  name: 'Body',
  created () {
    if (!this.$store.state.rootTableList.length) {
      this.$store.dispatch('load')
        .then(async () => {
          Vue.prototype.$db = {}
          for (const item of this.$store.state.rootTableList) {
            Vue.prototype.$db[item.tableId] = new DataStore({ filename: path.join(remote.app.getPath('userData'), item.tableId) }, { autoload: true })
            await new Promise(resolve => {
              Vue.prototype.$db[item.tableId].loadDatabase((err) => {
                if (err) throw new Error(`cannot load database ${item.tableId}`)
                else resolve(true)
              })
            })
          }
          this.$store.commit('changeIsAllLoad', true)
        })
    }
  }
})
</script>

<style lang="sass">
  #body
    background: radial-gradient(#4C5771, #20262C)
</style>
