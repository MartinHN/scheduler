<template>
  <div class="deviceInfo"  >
<span class=row>
          <button @click=setName>{{device.niceName}} (edit) </button>
          <select  :value=device.group @input='emitChange("group",$event.target.value)'>
            <option v-for="g of groupNames" :key=g.id >{{g}}</option>
          </select>
          <div :style="{maxWidth:'70px',background:!connected?'red':'inherit',color:device.rssi<-75?'orange':'inherit'}">{{connected?''+device.rssi:"not conn"}} dB</div>
</span>
<div class=row>
  <button :class="{active:selectedCap==c}" @click="selectedCap=c" v-for="c of device.caps || []" :key=c.id>{{c}}</button>
</div>
  <div v-if=selectedCap>
    <component :is=selectedCap :device=device> </component>
  </div>
<!-- <div>{{JSON.stringify(device)}}</div> -->

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Device } from '@/API/ServerAPI'
import { ServerModel } from '@/API/ServerModel'
import OSCCap from './cap/OSCCap.vue'

@Component({ components: { osc: OSCCap } })
export default class DeviceInfo extends Vue {
  @Prop({ required: true })
  device!:Device;

  selectedCap = ''
  async mounted () {
    // ask actual state without args
    this.sm.sendDeviceEvent(this.device.uuid, { type: 'activate' })
    this.sm.sendDeviceEvent(this.device.uuid, { type: 'niceName' })
  }

  get sm ():ServerModel { return (this.$root as any).sm }
  get connected () :boolean {
    return this.sm.isDeviceConnected(this.getDevice().uuid)
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

  setOnOff (b:boolean):void {
    this.sm.activateDevice(this.device, b)
  }
}
</script>

<style scoped>

</style>
