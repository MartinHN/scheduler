<template>
  <div class="deviceRow" >

          <button style=width:100% :class={notconnected:!connected,active:selected}  >{{(connected?'':'(disconnected) ') +deviceName}}</button>
          <button @click=setName>{{niceName}} (edit) </button>
          <button @click=setOnOff(true)> On </button>
          <button @click=setOnOff(false)> Off </button>
          <select>
            <option v-for="g of groupNames" :key=g.id >{{g}}</option>
          </select>
          <div>{{ip}}</div>
          <div :style="{color:rssi<-75?'red':'inherit'}">{{rssi}} dB</div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Device, newEmptyDevice } from '@/API/ServerAPI'

@Component({})
export default class DeviceRow extends Vue {
@Prop({ required: true })
deviceName!:string

@Prop({ default: 'no name' })
niceName!:string;

@Prop({ default: false })
connected!:boolean;

@Prop({ default: false })
selected!:boolean;

@Prop({ default: 'null' })
ip!:string;

@Prop({ default: -1 })
rssi!:number;

@Prop({ default: () => [] })
groupNames!:string[];
// selectDevice (s:string) :void{
//   this.$emit('input', s)
// }

mounted () {
  // ask actual state without args
  this.$emit('deviceEvent', { type: 'activate' })
}

getDevice ():Device {
  return { deviceName: this.deviceName, ip: this.ip, niceName: this.niceName, rssi: this.rssi }
}

emitChange (k:string, v:any) :void{
  const d = this.getDevice() as any
  d[k] = v
  this.$emit('input', d)
}

setName ():void {
  const gn = prompt('device name', this.niceName)
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
