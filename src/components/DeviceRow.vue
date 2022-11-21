<template>
  <div class="deviceRow">
    <button
      style="width: 100%"
      class="tab"
      :class="{ notconnected: !connected, active: selected }"
      @click="edit"
    >
      {{ btnName }}
    </button>
    <button
      @click="setOnOff(!device.activate)"
      :style="{ background: device.activate ? 'green' : 'gray' }"
    >
      Turn {{ device.activate ? "Off" : "On" }}
    </button>
    <!-- <button @click=setOnOff(true)> On </button>
          <button @click=setOnOff(false)> Off </button> -->

    <select
      v-if="groupNames && groupNames.length"
      :value="device.group"
      @input="emitChange('group', $event.target.value)"
    >
      <option v-for="g of groupNames" :key="g.id">{{ g }}</option>
    </select>
    <div v-else style="background: red">add Group first</div>
    <div
      :style="{
        maxWidth: '130px',
        background: !connected ? 'red' : 'inherit',
        color: device.rssi < -75 ? 'orange' : 'inherit',
      }"
    >
      {{ rssiTxt }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Device } from '@/API/ServerAPI'
import { ServerModel } from '@/API/ServerModel'

@Component({})
export default class DeviceRow extends Vue {
  @Prop({ default: false })
  selected!: boolean;

  @Prop({ required: true })
  device!: Device;

  updateP = 5000;
  lastAsked = new Date();
  _fetchDev = undefined as any;
  connected = false;
  mounted () {
    // ask actual state without args
    this.sm.sendDeviceEvent(this.device.uuid, { type: 'activate' })
    this.sm.sendDeviceEvent(this.device.uuid, { type: 'niceName' })
    this._fetchDev = setTimeout(() => { this.fetchDeviceInfo() }, Math.random() * 1000)
    this.connected = false
  }

  destroyed (): void {
    if (this._fetchDev) {
      clearTimeout(this._fetchDev)
    }
    if (this._updateCon) {
      clearTimeout(this._updateCon)
    }
  }

  get sm (): ServerModel {
    return (this.$root as any).sm
  }

  get groupNames () {
    return Object.keys(this.sm.groups)
  }

  getDevice (): Device {
    return this.device // return { deviceName: this.deviceName, ip: this.ip, niceName: this.niceName, rssi: this.rssi, uuid: this.uuid }
  }

  emitChange (k: string, v: any): void {
    const d = this.getDevice() as any
    d[k] = v
    this.$emit('input', d)
  }

  edit (): void {
    this.$emit('edit', this.getDevice())
  }

  get btnName (): string {
    let dN = this.device.deviceName
    if (dN.endsWith('.local')) {
      dN = dN.split('.local')[0]
    }
    return dN + ' / ' + this.device.niceName
  }

  fetchDeviceInfo (): void {
    console.log('fetching', this.device?.deviceName)
    if (this._fetchDev)clearTimeout(this._fetchDev)
    this.sm.sendDeviceEvent(this.device.uuid, { type: 'rssi' })
    const now = new Date()
    this.lastAsked = now
    this._fetchDev = setTimeout(this.fetchDeviceInfo.bind(this), this.updateP)
    if (this._updateCon)clearTimeout(this._updateCon)
    this._updateCon = setTimeout(this.updateConState.bind(this), 2000)
  }

  updateConState ():void{
    if (this._updateCon)clearTimeout(this._updateCon)
    const lt = this.device?.lastTimeModified.getTime()
    const now = new Date()
    const dt = now.getTime() - lt
    // console.log(dt, this.device?.lastTimeModified)
    const newConState = !!this.device && (dt >= 0 && dt < this.updateP + 3000)
    if (!newConState) { this._updateCon = setTimeout(this.updateConState.bind(this), 800) }
    if(newConState)  console.log(this.device?.name+' response took ', lt-this.lastAsked, 'ms')
    console.log(this.device?.name+'was modified ', dt, 'ms ago')
    if (newConState === this.connected) return
    this.connected = newConState
  }

  // setName ():void {
  //   const gn = prompt('device name', this.getDevice().niceName)
  //   if (gn) {
  //     this.emitChange('niceName', gn)
  //     this.sm.setDeviceNiceName(this.device, gn)
  //   }
  // }

  setOnOff (b: boolean): void {
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
.deviceRow {
  width: 100%;
  background: black;
  display: flex;
}
</style>
