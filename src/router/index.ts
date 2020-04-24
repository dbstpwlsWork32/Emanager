import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import SubDirectory from '@/views/SubDirectory.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/parent/:parent/:path*',
    name: 'SubDirectory',
    component: SubDirectory
  }
]

const router = new VueRouter({
  routes
})

export default router
