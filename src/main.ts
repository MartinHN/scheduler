import Vue from 'vue'
import App from './App.vue'
// import './registerServiceWorker'
import router from './router'
import { ServerModel } from './API/ServerModel'

Vue.config.productionTip = false

new Vue({
  router,
  data: {
    sm: new ServerModel()
  },
  render: h => h(App)
}).$mount('#app')
