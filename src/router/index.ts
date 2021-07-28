import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'
import AgendasView from '../views/AgendasView.vue'
import DevicesView from '../views/DevicesView.vue'
import InaugurationView from '../views/InaugurationView.vue'
import GroupView from '../views/GroupView.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/agendasView',
    name: 'AgendasView',
    component: AgendasView
  },
  {
    path: '/devicesView',
    name: 'DevicesView',
    component: DevicesView
  },
  {
    path: '/GroupView',
    name: 'GroupView',
    component: GroupView
  },
  {
    path: '/InaugurationView',
    name: 'InaugurationView',
    component: InaugurationView
  }
  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
