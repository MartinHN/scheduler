<template>

      <div class=devLiust>
        <!-- <input type='number' v-model=updateP /> -->
   <div style='display:flex' > <button @click=addDevice> Add Device </button>
    <button @click=removeDevice> Remove Device </button>
    <button @click=resetAll> Reset All Devices And Group</button>
   </div>
   <br>
   <div v-for="v of unregisteredDevice" :key=v.id>
    {{v}}<button @click=registerDevice(v.deviceName,v)> register </button>
  </div>
<br>
    <DeviceRow style=width:100% v-for="v of sortedKnownDevices" :key=v.id
    :device=v
    :selected="selectedDeviceUUID==v.uuid"
    @click.native="selectedDeviceUUID=v.uuid"
    @input=deviceChanged(v.uuid,$event)
    @deviceEvent=sendDeviceEvent(v.uuid,$event) />
  </div>
</template>

<script lang="ts">

// @ is an alias to /src
import { Component, Prop, Vue } from 'vue-property-decorator'

import DeviceRow from '@/components/DeviceRow.vue'
import * as ServerAPI from '@/API/ServerAPI'
import { newEmptyDevice, Device, DeviceDic, Groups } from '@/API/ServerAPI'

// interface Devices{knownDevices:DeviceDic}

import { ServerModel } from '@/API/ServerModel'

@Component({
  components: {
    DeviceRow
  }
})
export default class DeviceViewComp extends Vue {
  // availableGroups = [] as Groups

  updateP = 2000

  selectedDeviceUUID=''
  _fetchDev =undefined as any
  mounted ():void {
    this._fetchDev = setTimeout(this.fetchDeviceInfo.bind(this), this.updateP)
  }

  get sm ():ServerModel { return (this.$root as any).sm }
  get connectedDeviceList () { return this.sm.connectedDeviceList }
  get knownDevices () { return this.sm.knownDevices }

  sendDeviceEvent (uuid:string, o:any) {
    this.sm.sendDeviceEvent(uuid, o)
  }

  destroyed ():void {
    if (this._fetchDev) { clearTimeout(this._fetchDev) }
  }

  fetchDeviceInfo ():void {
    for (const d of Object.values(this.connectedDeviceList)) {
      this.sendDeviceEvent(d.uuid, { type: 'rssi' })
    }
    this._fetchDev = setTimeout(this.fetchDeviceInfo.bind(this), this.updateP)
  }

  get unregisteredDevice ():Device[] {
    return this.connectedDeviceList.slice().filter(d => this.knownDevices[d.uuid] === undefined)
  }

  get selectedDevice ():Device {
    return this.knownDevices[this.selectedDeviceUUID]
  }

  get selectedDeviceName () :string {
    return this.selectedDevice?.deviceName
  }

  get sortedKnownDevices () {
    const getS = (a:Device):string => { return (a.group ? a.group : 'aaaa') + a.niceName }
    return Object.values(this.knownDevices).sort((a, b) => { return getS(a).localeCompare(getS(b)) })
  }

  async addDevice ():Promise<void> {
    const gn = prompt('device name', this.selectedDeviceName)
    if (gn) {
      this.registerDevice(gn, newEmptyDevice(gn))
    }
  }

  async registerDevice (name:string, d:Device):Promise<void> {
    await Vue.set(this.knownDevices, d.uuid, d)
    this.selectedDeviceUUID = d.uuid
    this.save()
  }

  async removeDevice (n:string):Promise<void> {
    const gn = prompt('device name', this.selectedDeviceName)
    const targetD = Object.values(this.knownDevices).find(e => e.deviceName === gn)
    if (targetD) {
      await Vue.delete(this.knownDevices, targetD.uuid)
      this.selectedDeviceUUID = ''
    } else {
      console.error('nothing to remove')
    }
    this.save()
  }

  deviceChanged (k:string, newD:any) :void{
    this.save()
  }

  save () :void{
    ServerAPI.saveKnownDevices(this.knownDevices)
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

/*
#appContainer{
     display:grid;
     grid-auto-columns: 1fr 3fr;

}

#appContainer > :nth-child(2) {
  grid-column:2;
}

*/
</style>
