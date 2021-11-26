<template>
  <div class="deviceInfo"  >
    <div v-if=!sm.isDeviceConnected(device.uuid)>
   NotConnected
    </div>
<span class=row>

    <button @click=setName>{{device.niceName}} (edit) </button>

<div  >{{device.ip + ":" +device.port}}</div>
<div @click=setHostName> {{ device.deviceName}} </div>
<button @click=reboot class=warn> reboot </button>
<div @click=askUpdateTime>{{localTime}}</div>
</span>
<div class=row>
  <button :class="{active:selectedCapName==c}" @click="selectedCapName=c" v-for="c of validCapNames"  :key=c.id>{{c}}</button>
</div>
  <div v-if=selectedCapName >
    <component :is=selectedCapComponentName :name=selectedCapName :port=selectedCapPort :device=device> </component>
  </div>
<!-- <div>{{JSON.stringify(device)}}</div> -->

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import { Device, getTimeInfoForDevice } from '@/API/ServerAPI'
import { ServerModel } from '@/API/ServerModel'
import OSCCap from './cap/OSCCap.vue'
import HTMLCap from './cap/HTMLCap.vue'

@Component({ components: { OSCCap, HTMLCap } })
export default class DeviceInfo extends Vue {
  @Prop({ required: true })
  device!:Device;

  deviceTimeInfo= { localTime: '', utcTime: '' };
  _fetchTime =undefined as any
  selectedCapName = '';

  mounted () {
    // ask actual state without args
    this.sm.sendDeviceEvent(this.device.uuid, { type: 'activate' })
    this.sm.sendDeviceEvent(this.device.uuid, { type: 'niceName' })
    if (this._fetchTime) { clearTimeout(this._fetchTime) }
    // this._fetchTime = setInterval(async () => {
    //   await this.refreshTime()
    // }, 5000)
    this.refreshTime()
  }

  @Watch('device')
  deviceChCb () {
    this.selectedCapName = ''
    this.refreshTime()
  }

  async refreshTime () {
    this.deviceTimeInfo = await getTimeInfoForDevice(this.device).catch(e => console.error('time not avazilable on endpoint', e))
  }

  formatDate (dd:Date) {
    const d = new Date(dd)
    let month = '' + (d.getMonth() + 1)
    const year = '' + d.getFullYear()
    let day = '' + d.getDate()
    let hours = '' + d.getHours()
    const min = '' + d.getMinutes()
    const sec = '' + d.getSeconds()
    if (month.length < 2) { month = '0' + month }
    if (day.length < 2) { day = '0' + day }
    if (hours.length < 2) { hours = '0' + hours }

    return day + '/' + month + '/' + year + ' ' + hours + ':' + min + ':' + sec
  }

  askUpdateTime () {
    const ds = this.formatDate(new Date())
    if (confirm('update time? to ' + ds)) {
      this.updateFromLocal()
    }
  }

  updateFromLocal () {
    const ds = this.formatDate(new Date())
    console.log('sending date', ds)
    this.sm.setDeviceTimeStr(this.device, ds)
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

  get validCapNames () {
    return Object.keys(this.device.caps)
  }

  get selectedCapInstance () {
    return this.device.caps[this.selectedCapName]
  }

  get selectedCapType () {
    return this.selectedCapInstance?.type
  }

  get selectedCapComponentName () {
    if (this.selectedCapType === 'html') return 'HTMLCap'
    if (this.selectedCapType === 'osc') return 'OSCCap'
    console.error('invalid cap type', this.selectedCapType)
  }

  get selectedCapPort () {
    return this.selectedCapInstance?.port
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

  setHostName ():void {
    const hn = prompt('set HostName ,\n !!!! Reboot after this !!!', this.device.deviceName)
    if (hn) {
      this.sm.setDeviceHostName(this.device, hn)
    }
  }

  reboot () {
    const hn = confirm('!!!! Reboot Device ???')
    if (hn) {
      this.sm.rebootDevice(this.device)
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
