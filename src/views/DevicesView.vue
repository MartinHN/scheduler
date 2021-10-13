<template>

      <div class=grouplist>
        <input type='number' v-model=updateP />
    <button @click=addDevice> Add Device </button>
    <button @click=removeDevice> Remove Device </button>
    <button @click=resetAll> Reset All Devices And Group</button>
    <div v-for="v of unregisteredDevice" :key=v.id>
    {{v}}<button @click=registerDevice(v.deviceName,v)> register </button>
  </div>

    <DeviceRow style=width:100% v-for="v,k of knownDevices" :key=v.id
    :deviceName=v.deviceName
    :uuid = v.uuid
    :niceName=v.niceName
    :ip=v.ip
    :connected=isDeviceConnected(v.uuid)
    :selected="selectedDevice==k"
    :rssi=v.rssi
    @click.native="selectedDevice=k"
   @input=deviceChanged(k,$event)
    @deviceEvent=sendDeviceEvent(v.uuid,$event) />
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
const allowedWSData = ['connectedDeviceList'] as string[]
@Component({
  components: {
    DeviceRow
  }
})
export default class DeviceViewComp extends Vue {
  // availableGroups = [] as Groups
  connectedDeviceList = [] as Device[]
  knownDevices = {} as DeviceDic
  updateP = 2000

  selectedDevice=''
  _fetchDev =undefined as any
  mounted ():void {
    ws.init(this.newMessageFromWS, undefined)
    if (ws.isConnected())ws.send('server', { type: 'req', value: 'connectedDeviceList' })
    this.loadDevices()
    // allowedWSData = Object.keys(this).filter(e => !(e.startsWith('_') || e.startsWith('$')))
    // console.log('allowed data', allowedWSData)
    this._fetchDev = setTimeout(this.fetchDeviceInfo.bind(this), this.updateP)
  }

  destroyed ():void {
    if (this._fetchDev) { clearTimeout(this._fetchDev) }
  }

  fetchDeviceInfo ():void {
    for (const d of Object.values(this.connectedDeviceList)) {
      this.sendDeviceEvent(d.uuid, { type: 'rssi' })
    }
    setTimeout(this.fetchDeviceInfo.bind(this), this.updateP)
  }

  async loadDevices () :Promise<void> {
    const savedKnownDevices = await ServerAPI.getKnownDeviceList()
    const devs = {} as any
    for (const [k, v] of Object.entries(savedKnownDevices)) {
      devs[v.deviceName] = newEmptyDevice(v.deviceName, v)
    }
    console.log(devs)
    Vue.set(this, 'knownDevices', devs)
  }

  get unregisteredDevice ():Device[] {
    return this.connectedDeviceList.slice().filter(d => !this.isDeviceKnown(d.uuid))
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

  getKnownDevice (uuid:string):Device| undefined {
    for (const d of Object.values(this.knownDevices)) {
      if (d.uuid === uuid) { return d }
    }
    return undefined
  }

  isDeviceKnown (uuid:string):boolean {
    return this.getKnownDevice(uuid) !== undefined
  }

  isDeviceConnected (uuid:string):boolean {
    for (const d of Object.values(this.connectedDeviceList)) {
      if (d.uuid === uuid) { return true }
    }
    return false
  }

  newMessageFromWS (v:any):void {
    if (v.type && v.type === 'resp') {
      const { uuid, deviceName, msg } = v
      let dev = this.getKnownDevice(uuid)
      if (!dev)dev = this.connectedDeviceList.find(e => e.uuid === uuid)
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
        console.error('unknown dev for resp', uuid, deviceName)
      }
    } else if (allowedWSData.includes(v.type)) {
      console.log('new device list', v)
      const filled = v.data.map((d:Device) => newEmptyDevice(d.deviceName, d))
      Vue.set(this, v.type, filled)
    } else {
      console.error('unkown msg', v, 'allowed are', allowedWSData)
    }
  }

  getDevices ():DeviceDic {
    return this.knownDevices
  }

  save () :void{
    ServerAPI.saveKnownDevices(this.getDevices())
  }

  sendDeviceEvent (uuid:string, event:any):void {
    if (event.type) { ws.send('deviceEvent', { uuid, event }) } else { console.error('invalid event', event) }
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
