<template>
  <v-list>
    <v-list-group
      v-for="(dirs, index) in ipcCache"
      :key="`heart-${index}`"
    >
      <template v-slot:activator>
        <v-list-item-content @click="getDocsByHeartNum(index)">
          <v-list-item-title>{{index}} Heart</v-list-item-title>
        </v-list-item-content>
      </template>

      <v-list-item>
        <v-list-item-content style="max-height: 70vh; overflow-y: auto">
          <v-row no-gutters>
            <p v-if="!ipcCache[index].length">NO ITEMS....</p>
            <template v-for="dir in dirs">
              <dirSimpleCard
                :dir="dir"
                :key="dir._id"
              />
            </template>
          </v-row>
        </v-list-item-content>
      </v-list-item>
    </v-list-group>
  </v-list>
</template>

<script>
import Vue from 'vue'
import { ipcRenderer } from 'electron'
import path from 'path'
import dirSimpleCard from '@/components/dirCard/dir'

export default Vue.extend({
  name: 'favorite',
  data () {
    return {
      ipcCache: {
        1: [],
        2: [],
        3: [],
        4: [],
        5: []
      }
    }
  },
  methods: {
    async getDocsByHeartNum (_heartNum) {
      const heartNum = parseInt(_heartNum)
      const sendIpc = async tableId => {
        const result = await new Promise(resolve => {
          ipcRenderer.send('find_child', { tableId, query: { user: { rate: heartNum } } })
          ipcRenderer.once('find_child', (ev, rs) => {
            resolve(rs)
          })
        })

        return result.map(item => {
          return {
            ...item,
            name: path.parse(item.nowPath).base,
            tableId: tableId,
            docId: item._id
          }
        })
      }

      if (!this.ipcCache[heartNum].length) {
        let sendData = []
        for (const rootTable of this.$store.state.rootTableList) {
          sendData = sendData.concat(await sendIpc(rootTable.tableId))
        }

        this.ipcCache[heartNum] = sendData
      }
    }
  },
  components: {
    dirSimpleCard
  }
})
</script>
