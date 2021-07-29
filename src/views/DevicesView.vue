<template>

      <div class=grouplist>
    <button @click=addDevice> Add Device </button>
    <button @click=removeDevice> Remove Device </button>
    <button @click=resetAll> Reset All Devices And Group</button>

    <DeviceRow style=width:100% v-for="v,k of knownDevices" :key=v.id :deviceName=v.deviceName :niceName=v.niceName :ip=v.ip :connected=isDeviceConnected(k) :selected="selectedDevice==k" @click.native="selectedDevice=k" @input=deviceChanged(k,$event) @deviceEvent=newDeviceEvent(v.deviceName,$event) />
    <div v-for="v of unregisteredDevice" :key=v.id>
    {{v}}<button @click=registerDevice(v.deviceName,v)> register </button>
  </div>
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
// interface Devices{knownDevices:DeviceDic}
const allowedWSData = ['deviceList'] as string[]
@Component({
  components: {
    DeviceRow
  }
})
export default class DeviceViewComp extends Vue {
  deviceList = [] as Device[]
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

  get unregisteredDevice ():Device[] {
    return this.deviceList.slice().filter(d => !this.isDeviceKnown(d.deviceName))
  }

  async addDevice ():Promise<void> {
    const gn = prompt('device name', this.selectedDevice)
    if (gn) {
      this.registerDevice(gn, newEmptyDevice(gn))
    }
  }

  async registerDevice (name:string, d:Device):Promise<void> {
    await Vue.set(this.knownDevices, name, d)
    this.selectedDevice = name
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

  deviceChanged (k:string, newD:any) :void{
    Vue.set(this.knownDevices, k, newD)
    this.save()
  }

  isDeviceKnown (n:string):boolean {
    for (const d of Object.values(this.knownDevices)) {
      if (d.deviceName === n) { return true }
    }
    return false
  }

  isDeviceConnected (n:string):boolean {
    for (const d of Object.values(this.deviceList)) {
      if (d.deviceName === n) { return true }
    }
    return false
  }

  newMessage (v:any):void {
    console.log('new device ws', v)

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

  newDeviceEvent (deviceName:string, event:any):void {
    if (event.type) { ws.send('deviceEvent', { deviceName, event }) } else { console.error('invalid event', event) }
  }

  async resetAll ():Promise<void> {
    if (confirm('areYiou Sureee')) {
      await postJSON('resetRasps', {})
      document.location.reload()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
