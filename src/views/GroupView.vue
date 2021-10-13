<template>
  <div>
      <GroupList :connectedDevices=connectedDeviceList  />

  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Prop, Vue } from 'vue-property-decorator'

import GroupList from '@/components/GroupList.vue'
import ws from '../ws'

const allowedWSData = ['connectedDeviceList'] as string[]
@Component({
  components: {
    GroupList
  }
})
export default class DeviceViewComp extends Vue {
  connectedDeviceList = [] as string[]

  mounted ():void {
    ws.init(this.newMessage, undefined)

    // allowedWSData = Object.keys(this).filter(e => !(e.startsWith('_') || e.startsWith('$')))
    // console.log('allowed data', allowedWSData)
  }

  newMessage (v:any):void {
    console.log(v)

    if (allowedWSData.includes(v.type)) {
      console.log('setting groupMsg', v)
      Vue.set(this, v.type, v.data)
    } else {
      console.error('unkown msg', v, allowedWSData)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.header{
  display:flex
}
</style>
