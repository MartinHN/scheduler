<template>
  <div class="deviceRow" >
      <!-- <select style=width:100% v-model=currentDevice @change="selectDevice($event.target.value)">
          <option style=width:100% v-for="v,k of deviceList" :key=v.id :value=v>{{v}} {{ k}}</option>
      </select> -->
      <div > {{ name}} </div>

          <button style=width:100% :class={notconnected:!connected}  >{{(connected?'':'(disconnected) ') +name}}</button>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

export interface Device{
  name:string;
}

export function newEmptyDevice (name:string):Device {
  return { name }
}

@Component({})
export default class DeviceRow extends Vue {
@Prop({ default: 'no name' })
name!:string

@Prop({ default: false })
connected!:boolean;

@Prop({ default: false })
selected!:boolean;
// selectDevice (s:string) :void{
//   this.$emit('input', s)
// }

getDevice ():Device {
  return JSON.parse(JSON.stringify({ name: this.name }))
}

save () :void{
  this.$emit('input', this.getDevice())
}
}
</script>

<style scoped>
.deviceRow{
  width:100%;
 background:black;
}
</style>
