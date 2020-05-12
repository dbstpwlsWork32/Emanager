import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import oneDirectory from '@/components/oneDirectory.vue'
import videoViewer from '@/components/viewer/video.vue'
import favorite from '@/views/pages/favorite.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/openDir/:tableId/:docId',
    name: 'oneDirectory',
    props: true,
    component: oneDirectory
  },
  {
    path: '/video/:tableId/:docId/:fileBase',
    name: 'videoViewer',
    props: true,
    component: videoViewer
  },
  {
    path: '/favorite',
    name: 'favorite',
    component: favorite
  }
]

const router = new VueRouter({
  routes
})

export default router
