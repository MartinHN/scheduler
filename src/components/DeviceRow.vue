<template>
  <div class="deviceRow" >

          <button style=width:100% :class={notconnected:!connected,active:selected}  >{{(connected?'':'(disconnected) ') +device.deviceName}}</button>
          <button @click=setName>{{device.niceName}} (edit) </button>
          <button @click=setOnOff(true)> On </button>
          <button @click=setOnOff(false)> Off </button>
          <select>
            <option v-for="g of groupNames" :key=g.id >{{g}}</option>
          </select>
          <!-- <div>{{ip}}</div> -->
          <div :style="{background:!connected?'red':'inherit',color:device.rssi<-75?'orange':'inherit'}">{{device.rssi}} dB</div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Device } from '@/API/ServerAPI'
import { ServerModel } from '@/API/ServerModel'

@Component({})
export default class DeviceRow extends Vue {
//   @Prop({ required: true })
//   uuid!:string;

  // @Prop({ default: 'no deviceName' })
  // deviceName!:string

  // @Prop({ default: 'no nicename' })
  // niceName!:string;

  // @Prop({ default: false })
  // connected!:boolean;

  @Prop({ default: false })
  selected!:boolean;

  // @Prop({ default: 'null' })
  // ip!:string;

  // @Prop({ default: -1 })
  // rssi!:number;

  // @Prop({ default: () => [] })
  // group!:string;

@Prop({ required: true })
device!:Device;
// selectDevice (s:string) :void{
//   this.$emit('input', s)
// }

mounted () {
  // ask actual state without args
  this.$emit('deviceEvent', { type: 'activate' })
}

get groupNames () {
  return []
}

get sm ():ServerModel { return (this.$root as any).sm }
get connected () :boolean {
  return this.sm.isDeviceConnected(this.getDevice().uuid)
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
  }
}

setOnOff (b:boolean):void {
  this.$emit('deviceEvent', { type: 'activate', value: b ? 1 : 0 })
}
}
</script>

<style scoped>
.deviceRow{
  width:100%;
 background:black;
 display:flex;
}
</style>
