<template>

      <div class=grouplist>
    <!-- <DeviceList  :deviceList=deviceList  /> -->
    <button @click=addDevice> Add Device </button>
    <button @click=removeDevice> Remove Device </button>
          <DeviceRow style=width:100% v-for="v,k of knownDevices" :key=v.id :name=v.name  :connected=isDeviceConnected(k) :selected="selectedDevice==k" @click="selectedDevice=k"  />

  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Prop, Vue } from 'vue-property-decorator'

import DeviceRow, { newEmptyDevice, Device } from '@/components/DeviceRow.vue'

import { getJSON, postJSON, deleteJSON } from '@/API/API'
import ws from '../ws'

const connection :any = {}
type DeviceDic = {[id:string]:Device};
interface Devices{knownDevices:DeviceDic}
const allowedWSData = ['deviceList'] as string[]
@Component({
  components: {
    DeviceRow
  }
})
export default class DeviceViewComp extends Vue {
  deviceList = [] as string[]
  knownDevices = {} as DeviceDic
  selectedDevice=''
  mounted ():void {
    ws.init(this.newMessage, undefined)
    this.loadDevices()
    // allowedWSData = Object.keys(this).filter(e => !(e.startsWith('_') || e.startsWith('$')))
    // console.log('allowed data', allowedWSData)
  }

  async loadDevices () :Promise<void> {
    this.knownDevices = await getJSON('knownDevices')
  }

  async addDevice ():Promise<void> {
    const gn = prompt('device name', this.selectedDevice)
    if (gn) {
      await Vue.set(this.knownDevices, gn, newEmptyDevice(gn))
      this.selectedDevice = gn
    }
    this.save()
  }

  async removeDevice (n:string):Promise<void> {
    const gn = prompt('device name', this.selectedDevice)
    if (gn) {
      await Vue.delete(this.knownDevices, gn)
      this.selectedDevice = ''
    }
    this.save()
  }

  isDeviceConnected (uuid:string):boolean {
    return Object.keys(this.deviceList).includes(uuid)
  }

  newMessage (v:any):void {
    console.log(v)

    if (allowedWSData.includes(v.type)) { Vue.set(this, v.type, v.data) } else {
      console.error('unkown msg', v, allowedWSData)
    }
  }

  getDevices ():DeviceDic {
    return this.knownDevices
  }

  save () :void{
    postJSON('knownDevices', JSON.parse(JSON.stringify(this.getDevices())))
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
