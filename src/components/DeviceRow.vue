<template>
  <div class="deviceRow" >

          <button style=width:100% :class={notconnected:!connected,active:selected}  >{{(connected?'':'(disconnected) ') +name}}</button>
          <button @click=setName> edit </button>
          <button @click=setOnOff(true)> On </button>
          <button @click=setOnOff(false)> Off </button>
          <div>{{ip}}</div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { getJSON, postJSON, deleteJSON } from '@/API/API'

export interface Device{
  name:string;
  ip:string;
}

export function newEmptyDevice (name:string):Device {
  return { name, ip: 'null' }
}

@Component({})
export default class DeviceRow extends Vue {
@Prop({ default: 'no name' })
name!:string

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
  return { name: this.name, ip: this.ip }
}

emitChange (k:string, v:any) :void{
  const d = this.getDevice() as any
  d[k] = v
  this.$emit('input', d)
}

setName ():void {
  const gn = prompt('group name', this.name)
  if (gn) {
    this.emitChange('name', gn)
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
