import Vue from 'vue'
import Vuex from 'vuex'
import parentDir from './models/parentDir'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    parentDir
  }
})
