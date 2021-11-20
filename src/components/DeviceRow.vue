<template>
  <div class="deviceRow" >

          <button style=width:100% class=tab :class={notconnected:!connected,active:selected} @click=edit  > {{device.niceName}}</button>
          <button @click=setOnOff(!device.activate) :style="{background:device.activate?'green':'gray'}" > Turn {{device.activate?"Off":"On"}} </button>
          <!-- <button @click=setOnOff(true)> On </button>
          <button @click=setOnOff(false)> Off </button> -->

          <select v-if="(groupNames && groupNames.length)"  :value=device.group @input='emitChange("group",$event.target.value)'>
            <option v-for="g of groupNames" :key=g.id >{{g}}</option>
          </select>
          <div v-else style=background:red >
            add Group first
          </div>
          <div :style="{maxWidth:'70px',background:!connected?'red':'inherit',color:device.rssi<-75?'orange':'inherit'}">{{rssiTxt}}</div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Device } from '@/API/ServerAPI'
import { ServerModel } from '@/API/ServerModel'

@Component({})
export default class DeviceRow extends Vue {
  @Prop({ default: false })
  selected!:boolean;

  @Prop({ required: true })
  device!:Device;

  mounted () {
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

  edit ():void {
    this.$emit('edit', this.getDevice())
  }

  // setName ():void {
  //   const gn = prompt('device name', this.getDevice().niceName)
  //   if (gn) {
  //     this.emitChange('niceName', gn)
  //     this.sm.setDeviceNiceName(this.device, gn)
  //   }
  // }

  setOnOff (b:boolean):void {
    this.sm.activateDevice(this.device, b)
  }

  get rssiTxt () {
    if (!this.connected) {
      return 'déconnecté'
    }
    if (this.sm.isAdminMode) {
      return this.device.rssi + ' dB'
    } else {
      return 'connecté'
    }
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
