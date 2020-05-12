<template>
  <v-list>
    <v-list-group>
      <template v-slot:activator>
        <v-list-item-content @click="getDocsByHeartNum(5)">
          <v-list-item-title>5 Heart</v-list-item-title>
        </v-list-item-content>
      </template>

      <v-list-item>
        <v-list-item-content style="max-height: 70vh; overflow-y: auto">
          <v-row no-gutters>
            <p v-if="!ipcCache[5].length">NO ITEMS....</p>
            <dirSimpleCard
              v-for="dir in ipcCache[5]"
              :key="dir._id"
              :dir="dir"
            />
          </v-row>
        </v-list-item-content>
      </v-list-item>
    </v-list-group>

    <v-list-group>
      <template v-slot:activator>
        <v-list-item-content @click="getDocsByHeartNum(4)">
          <v-list-item-title>4 Heart</v-list-item-title>
        </v-list-item-content>
      </template>

      <v-list-item>
        <v-list-item-content style="max-height: 70vh; overflow-y: auto">
          <v-row no-gutters>
            <p v-if="!ipcCache[4].length">NO ITEMS....</p>
            <dirSimpleCard
              v-for="dir in ipcCache[4]"
              :key="dir._id"
              :dir="dir"
            />
          </v-row>
        </v-list-item-content>
      </v-list-item>
    </v-list-group>

    <v-list-group>
      <template v-slot:activator>
        <v-list-item-content @click="getDocsByHeartNum(3)">
          <v-list-item-title>3 Heart</v-list-item-title>
        </v-list-item-content>
      </template>

      <v-list-item>
        <v-list-item-content style="max-height: 70vh; overflow-y: auto">
          <v-row no-gutters>
            <p v-if="!ipcCache[3].length">NO ITEMS....</p>
            <dirSimpleCard
              v-for="dir in ipcCache[3]"
              :key="dir._id"
              :dir="dir"
            />
          </v-row>
        </v-list-item-content>
      </v-list-item>
    </v-list-group>

    <v-list-group>
      <template v-slot:activator>
        <v-list-item-content @click="getDocsByHeartNum(2)">
          <v-list-item-title>2 Heart</v-list-item-title>
        </v-list-item-content>
      </template>

      <v-list-item>
        <v-list-item-content style="max-height: 70vh; overflow-y: auto">
          <v-row no-gutters>
            <p v-if="!ipcCache[2].length">NO ITEMS....</p>
            <dirSimpleCard
              v-for="dir in ipcCache[2]"
              :key="dir._id"
              :dir="dir"
            />
          </v-row>
        </v-list-item-content>
      </v-list-item>
    </v-list-group>

    <v-list-group>
      <template v-slot:activator>
        <v-list-item-content @click="getDocsByHeartNum(1)">
          <v-list-item-title>1 Heart</v-list-item-title>
        </v-list-item-content>
      </template>

      <v-list-item>
        <v-list-item-content style="max-height: 70vh; overflow-y: auto">
          <v-row no-gutters>
            <p v-if="!ipcCache[1].length">NO ITEMS....</p>
            <dirSimpleCard
              v-for="dir in ipcCache[1]"
              :key="dir._id"
              :dir="dir"
            />
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
    async getDocsByHeartNum (heartNum) {
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
