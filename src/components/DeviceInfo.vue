<template>
  <div class="deviceInfo"  >
    <div v-if=sm.isDeviceConnected(device.uuid)>

<span class=row>
          <button @click=setName>{{device.niceName}} (edit) </button>

<div>{{device.ip + ":" +device.port}}</div>
<div>{{localTime}}</div>
</span>
<div class=row>
  <button :class="{active:selectedCap==c}" @click="selectedCap=c" v-for="c of validCaps"  :key=c.id>{{c}}</button>
</div>
  <div v-if=selectedCap >
    <component :is=selectedCap :device=device> </component>
  </div>
<!-- <div>{{JSON.stringify(device)}}</div> -->
    </div>
    <div v-else class="notConnected customFont">
      NotConnected
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import { Device, getTimeInfoForDevice } from '@/API/ServerAPI'
import { ServerModel } from '@/API/ServerModel'
import OSCCap from './cap/OSCCap.vue'

@Component({ components: { osc: OSCCap } })
export default class DeviceInfo extends Vue {
  @Prop({ required: true })
  device!:Device;

  deviceTimeInfo= { localTime: '', utcTime: '' };
  _fetchTime =undefined as any
  selectedCap = ''
  async mounted () {
    // ask actual state without args
    this.sm.sendDeviceEvent(this.device.uuid, { type: 'activate' })
    this.sm.sendDeviceEvent(this.device.uuid, { type: 'niceName' })
    if (this._fetchTime) { clearTimeout(this._fetchTime) }
    this._fetchTime = setInterval(async () => {
      await this.refreshTime()
    }, 5000)
    this.refreshTime()
  }

  @Watch('device')
  deviceChCb () {
    this.selectedCap = ''
    this.refreshTime()
  }

  async refreshTime () {
    this.deviceTimeInfo = await getTimeInfoForDevice(this.device).catch(e => console.error('time not avazilable on endpoint', e))
  }

  get localTime () {
    if ((!this.deviceTimeInfo) || !this.deviceTimeInfo.localTime) { return 'no time' }
    return (new Date(this.deviceTimeInfo.localTime)).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })
  }

  destroyed ():void {
    if (this._fetchTime) { clearTimeout(this._fetchTime) }
  }

  get sm ():ServerModel { return (this.$root as any).sm }
  get connected () :boolean {
    return this.sm.isDeviceConnected(this.getDevice().uuid)
  }

  get validCaps () {
    return (this.device.caps || []).filter(e => e.length > 0)
  }

  get groupNames () {
    return Object.keys(this.sm.groups)
  }

  getDevice ():Device {
    return this.device // return { deviceName: this.deviceName, ip: this.ip, niceName: this.niceName, rssi: this.rssi, uuid: this.uuid }
  }

  emitChange (k:string, v:any) :void{
    const d = this.getDevice() as any
    d[k] = v
    this.$emit('input', d)
  }

  setName ():void {
    const gn = prompt('device name', this.getDevice().niceName)
    if (gn) {
      this.emitChange('niceName', gn)
      this.sm.setDeviceNiceName(this.device, gn)
    }
  }
}
</script>

<style scoped>
.notConnected{
  background: red;
  font-size:5em;
}
</style>
