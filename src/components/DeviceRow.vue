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

import { Device, getRSSIFromDevice } from '@/API/ServerAPI'
import { ServerModel } from '@/API/ServerModel'

@Component({})
export default class DeviceRow extends Vue {
  @Prop({ default: false })
  selected!: boolean;

  @Prop({ required: true })
  device!: Device;

  fechtP = 2500;
  slowFechtP = 5000;
  fastFechtP = 2500;
  numFastPing = 0;
  delayToBeDead = 5 * 1000;

  lastAsked = new Date();
  _fetchDev = undefined as any;
  connected = false;
  mounted () {
    // ask actual state without args
    this.sm.sendDeviceEvent(this.device.uuid, { type: 'activate' })
    this.sm.sendDeviceEvent(this.device.uuid, { type: 'niceName' })
    this._fetchDev = setTimeout(() => { this.fetchDeviceInfo() }, Math.random() * this.fechtP)
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
    if (this._fetchDev)clearTimeout(this._fetchDev)
    this.updateConState()
    console.log('fetching', this.device?.deviceName)
    // this.sm.sendDeviceEvent(this.device.uuid, { type: 'rssi' })
    getRSSIFromDevice(this.device, this.fechtP - 500).then(res => {
      if (this.device) {
        this.device.rssi = parseInt(res)
        this.device.lastTimeModified = new Date()
      } else console.error('no device but fetched rssi')
    }).catch(e => {
      console.error('failed getting rssi', e)
    })
    this.lastAsked = new Date()
    this._fetchDev = setTimeout(this.fetchDeviceInfo.bind(this), this.fechtP)
  }

  updateConState ():void{
    const lt = this.device?.lastTimeModified.getTime()
    const now = new Date()
    const dt = now.getTime() - lt
    const newConState = !!this.device && (dt >= 0 && dt < this.delayToBeDead)
    const pingT = lt - this.lastAsked
    const wasFastPing = pingT >= 0 && (pingT < 200)
    this.numFastPing = wasFastPing ? this.numFastPing + 1 : 0
    this.numFastPing = Math.max(0, Math.min(5, this.numFastPing))
    this.fechtP = this.numFastPing === 5 ? this.slowFechtP : this.fastFechtP
    if (newConState) console.log(this.device?.deviceName + ' response took ', lt - this.lastAsked, 'ms')
    console.log(this.device?.deviceName + 'was modified ', dt, 'ms ago')
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
