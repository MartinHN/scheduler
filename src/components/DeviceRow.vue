<template>
  <div class="deviceRow">
    <button
      class="tab defaultItem"
      :class="{ notconnected: !connected, active: selected }"
      @click="edit"
    >
      <div
        class="nameContainer"
        style="margin-right:10px; "
      >
        <div
          class="col textName"
        >
          <img
            v-if="shortDevName.startsWith('L')"
            class="minIcon"
            src="img/bulbNSpeakH.svg"
          >
          <img
            v-if="shortDevName.startsWith('R')"
            class="minIcon"
            src="img/relay.svg"
          >
          {{ shortDevName }}
        </div>
        <div
          class="col textName"
        >
          {{ device.niceName }}
        </div>
      </div>
    </button>
    <button
      class="defaultItem"
      :style="{ minWidth: '15vw', background: device.activate ? 'green' : 'gray' }"
      @click="setOnOff(!device.activate)"
    >
      {{ sm.isAgendaDisabled ? "Turn " : "" }}{{ device.activate ? "Off" : "On" }}
    </button>
    <!-- <button @click=setOnOff(true)> On </button>
          <button @click=setOnOff(false)> Off </button> -->

    <select
      v-if="groupNames && groupNames.length"
      class="groupSelect"
      :value="device.group"
      @input="emitChange('group', $event.target.value)"
    >
      <option
        v-for="g of groupNames"
        :key="g"
      >
        {{ g }}
      </option>
    </select>
    <div
      v-else
      class="groupSelect"
      style="background: red"
    >
      add Group first
    </div>
    <div
      :style="{
        flex: '0.001 1 5em',
        borderRadius: '5px',
        background: !connected ? 'red' : 'inherit',
        color: parseInt(device.rssi) < -75 ? 'orange' : 'inherit',
      }"
    >
      {{ rssiTxt }}

      <div
        v-if="isAdminMode && connected"
        style="max-width:50px"
      >
        {{ isSynchronizing?"sync...":"agendOk" }}
      </div>
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
    selected!: boolean

  @Prop({ required: true })
    device!: Device

  fechtP = 2500
  slowFechtP = 5000
  fastFechtP = 2500
  numFastPing = 0
  delayToBeDead = 5 * 1000

  lastAsked = new Date()
  _fetchDev = undefined as any
  connected = false
  isAgendaInSync = false
  mounted () {
    // ask actual state without args
    this.sm.sendDeviceEvent(this.device.uuid, { type: 'activate' })
    this.sm.sendDeviceEvent(this.device.uuid, { type: 'niceName' })
    this._fetchDev = setTimeout(() => { this.fetchDeviceInfo() }, Math.random() * 100)
    this.connected = false
  }

  destroyed (): void {
    if (this._fetchDev) {
      clearTimeout(this._fetchDev)
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

  get isAdminMode() {
    return this.sm.isAdminMode
  }

  emitChange (k: string, v: any): void {
    const d = this.getDevice() as any
    d[k] = v
    this.$emit('input', d)
  }

  edit (): void {
    this.$emit('edit', this.getDevice())
  }

  get shortDevName (): string {
    let dN = this.device.deviceName
    if (dN.endsWith('.local')) {
      dN = dN.split('.local')[0]
    }
    return dN.replace('_', ' ').replace('lumestrio', 'L').replace('relay', 'R')
  }

  get isSynchronizing() {
    return this.isAdminMode && this.connected && !this.isAgendaInSync
  }

  fetchDeviceInfo (): void {
    if (this._fetchDev)clearTimeout(this._fetchDev)

    console.log('fetching', this.device?.deviceName)
    this.sm.sendDeviceEvent(this.device.uuid, { type: 'rssi' })
    this.updateConState()
    this.lastAsked = new Date()
    this._fetchDev = setTimeout(this.fetchDeviceInfo.bind(this), this.fechtP)
  }

  async refreshAgendaStatus() {
    if (this.isAdminMode && this.connected) { this.isAgendaInSync = await this.sm.isAgendaSync(this.device) } else { this.isAgendaInSync = false }
  }

  niceDebugMs(ms: number) {
    if (ms < 1000) { return ms + 'ms' }
    ms = Math.floor(ms / 1000)
    if (ms < 60) { return ms + 's' }
    ms = Math.floor(ms / 60)
    if (ms < 60) { return ms + 'm' }
    ms = Math.floor(ms / 60)
    if (ms < 24) { return ms + 'h' }
    ms = Math.floor(ms / 24)
    return ms + 'days'
  }

  updateConState ():void {
    const lt = this.device?.lastTimeModified.getTime()
    const now = new Date()
    const dt = now.getTime() - lt
    const newConState = !!this.device && (dt >= 0 && dt < this.delayToBeDead)
    const pingT = lt - this.lastAsked.getTime()
    const wasFastPing = pingT >= 0 && (pingT < 200)
    this.numFastPing = wasFastPing ? this.numFastPing + 1 : 0
    this.numFastPing = Math.max(0, Math.min(5, this.numFastPing))
    this.fechtP = this.numFastPing === 5 ? this.slowFechtP : this.fastFechtP
    if (newConState) console.log(this.device?.deviceName + ' last response took ~', lt - this.lastAsked.getTime(), 'ms')
    console.log(this.device?.deviceName + 'was modified ', this.niceDebugMs(dt), ' ago')

    if (newConState === this.connected) return
    this.connected = newConState

    if (newConState && !this.isAgendaInSync) {
      this.refreshAgendaStatus()
    }
  }

  // setName ():void {
  //   const gn = prompt('device name', this.getDevice().niceName)
  //   if (gn) {
  //     this.emitChange('niceName', gn)
  //     this.sm.setDeviceNiceName(this.device, gn)
  //   }
  // }

  setOnOff (b: boolean): void {
    if (!this.sm.isAgendaDisabled) {
      const msg = "L'agenda est encore actif et ne prendra pas en compte la commande\n voulez vous désactiver l'agenda?"
      if (confirm(msg)) { this.sm.setAgendaDisabled(true) } else return
    }
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

.defaultItem{
  flex:1 1 30%;
}

#app .groupSelect{
  max-width: 25vw;
  min-width: 10vw;
  flex:1 0 10vw;
}

div {
  width: 100%;
  white-space: nowrap;
}

.deviceRow {
  width: 100%;
  background: black;
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  filter: drop-shadow(2px 3px 3px black);
}

.minIcon{
  max-height: 20px;
  margin: 0 5px 0 0;
  align-self: center;
}
.textName{
  overflow-wrap: anywhere;
  text-align: left;
  justify-content: flex-start;
  align-items: center;
  white-space: nowrap;
}

.tab{
  flex-shrink: 0;
}

.nameContainer{
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

</style>
