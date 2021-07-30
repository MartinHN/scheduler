<template>

      <div class=grouplist>
    <button @click=addDevice> Add Device </button>
    <button @click=removeDevice> Remove Device </button>
    <button @click=resetAll> Reset All Devices And Group</button>
    <div v-for="v of unregisteredDevice" :key=v.id>
    {{v}}<button @click=registerDevice(v.deviceName,v)> register </button>
  </div>

    <DeviceRow style=width:100% v-for="v,k of knownDevices" :key=v.id
    :deviceName=v.deviceName
    :niceName=v.niceName
    :ip=v.ip
    :connected=isDeviceConnected(k)
    :selected="selectedDevice==k"
    :rssi=v.rssi
    @click.native="selectedDevice=k"
    @input=deviceChanged(k,$event)
    @deviceEvent=sendDeviceEvent(v.deviceName,$event) />
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Prop, Vue } from 'vue-property-decorator'

import DeviceRow from '@/components/DeviceRow.vue'
import * as ServerAPI from '@/API/ServerAPI'
import { newEmptyDevice, Device, DeviceDic, Groups } from '@/API/ServerAPI'
import ws from '../ws'

const connection :any = {}

// interface Devices{knownDevices:DeviceDic}
const allowedWSData = ['deviceList'] as string[]
@Component({
  components: {
    DeviceRow
  }
})
export default class DeviceViewComp extends Vue {
  // availableGroups = [] as Groups
  deviceList = [] as Device[]
  knownDevices = {} as DeviceDic

  selectedDevice=''
  mounted ():void {
    ws.init(this.newMessageFromWS, undefined)
    this.loadDevices()
    // allowedWSData = Object.keys(this).filter(e => !(e.startsWith('_') || e.startsWith('$')))
    // console.log('allowed data', allowedWSData)
  }

  fetchDeviceInfo () {
    for (const d of Object.values(this.deviceList)) {
      this.sendDeviceEvent(d.deviceName, { type: 'rssi' })
    }
  }

  async loadDevices () :Promise<void> {
    const savedKnownDevices = ServerAPI.getKnownDeviceList()
    this.knownDevices = {}
    for (const [k, v] of Object.entries(savedKnownDevices)) {
      Vue.set(this.knownDevices, v.deviceName, newEmptyDevice(v.deviceName, v))
    }
    setInterval(this.fetchDeviceInfo.bind(this), 2000)
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

  getKnownDevice (n:string):Device| undefined {
    for (const d of Object.values(this.knownDevices)) {
      if (d.deviceName === n) { return d }
    }
    return undefined
  }

  isDeviceKnown (n:string):boolean {
    return this.getKnownDevice(n) !== undefined
  }

  isDeviceConnected (n:string):boolean {
    for (const d of Object.values(this.deviceList)) {
      if (d.deviceName === n) { return true }
    }
    return false
  }

  newMessageFromWS (v:any):void {
    if (v.type && v.type === 'resp') {
      const { deviceName, msg } = v
      const dev = this.getKnownDevice(deviceName)
      if (dev) {
        const prop = msg.address.substr(1)
        const value = msg.args[0]
        const availableProps = Object.keys(dev) // ['rssi']
        // console.log('new resp', prop, value)
        if (availableProps.includes(prop)) {
          (dev as any)[prop] = value
        } else {
          console.error('unknown prop', prop, availableProps)
        }
      } else {
        console.error('unknown dev', deviceName)
      }
    } else {
      console.log('new device list', v)
      if (allowedWSData.includes(v.type)) {
        const filled = v.data.map((d:Device) => newEmptyDevice(d.deviceName, d))
        Vue.set(this, v.type, filled)
      } else {
        console.error('unkown msg', v, allowedWSData)
      }
    }
  }

  getDevices ():DeviceDic {
    return this.knownDevices
  }

  save () :void{
    ServerAPI.saveKnownDevices(this.getDevices())
  }

  sendDeviceEvent (deviceName:string, event:any):void {
    if (event.type) { ws.send('deviceEvent', { deviceName, event }) } else { console.error('invalid event', event) }
  }

  async resetAll ():Promise<void> {
    if (confirm('areYiou Sureee')) {
      await ServerAPI.resetDevicesAndGroups()
      document.location.reload()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
