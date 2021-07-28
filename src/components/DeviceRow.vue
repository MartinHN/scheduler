<template>
  <div class="deviceRow" >

          <button style=width:100% :class={notconnected:!connected,active:selected}  >{{(connected?'':'(disconnected) ') +deviceName}}</button>
          <button @click=setName>{{niceName}} (edit) </button>
          <button @click=setOnOff(true)> On </button>
          <button @click=setOnOff(false)> Off </button>
          <div>{{ip}}</div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { getJSON, postJSON, deleteJSON } from '@/API/API'

export interface Device{
  deviceName:string;
  niceName:string;
  ip:string;
}

export function newEmptyDevice (deviceName:string):Device {
  return { deviceName, ip: 'null', niceName: 'no name' }
}

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
// selectDevice (s:string) :void{
//   this.$emit('input', s)
// }

getDevice ():Device {
  return { deviceName: this.deviceName, ip: this.ip, niceName: this.niceName }
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
