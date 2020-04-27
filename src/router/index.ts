import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import oneDirectory from '@/components/oneDirectory.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/parent/:parent/:path*',
    name: 'oneDirectory',
    component: oneDirectory
  }
]

const router = new VueRouter({
  routes
})

export default router
