<template>
  <div class="deviceInfo">
    <div v-if="!sm.isDeviceConnected(device.uuid)">
      NotConnected
    </div>
    <span class="row">
      <button @click="setName">{{ device.niceName }} (edit)</button>

      <div>{{ device.ip + ":" + device.port }}</div>
      <div @click="setHostName">{{ device.deviceName }}</div>
      <button
        class="warn"
        @click="reboot"
      >reboot</button>
      <div @click="askUpdateTime">{{ localTime }}</div>
      <div v-if="!isAgendaInSync"> agenda not sync</div>
    </span>
    <div class="row">
      <button
        v-for="c of validCapNames"
        :key="c"
        :class="{ active: selectedCapName == c }"
        @click="selectedCapName = c"
      >
        {{ c }}
      </button>
    </div>
    <div v-if="selectedCapName">
      <component
        :is="selectedCapComponentName"
        :name="selectedCapName"
        :port="selectedCapPort"
        :device="device"
      />
    </div>
    <!-- <div>{{JSON.stringify(device)}}</div> -->
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import { Device, getTimeInfoForDevice, getAgendaInfoForDevice } from '@/API/ServerAPI'
import { ServerModel } from '@/API/ServerModel'
import OSCCap from './cap/OSCCap.vue'
import HTMLCap from './cap/HTMLCap.vue'
import { dateToStr } from '@/API/types/ScheduleTypes'
@Component({ components: { OSCCap, HTMLCap } })
export default class DeviceInfo extends Vue {
  @Prop({ required: true })
    device!: Device

  deviceTimeInfo = { localTime: '', utcTime: '' }
  _fetchTime = undefined as any
  selectedCapName = ''

  isAgendaInSync = false

  mounted () {
    // ask actual state without args
    this.sm.sendDeviceEvent(this.device.uuid, { type: 'activate' })
    this.sm.sendDeviceEvent(this.device.uuid, { type: 'niceName' })
    if (this._fetchTime) {
      clearTimeout(this._fetchTime)
    }
    this._fetchTime = setInterval(async () => {
      await this.refreshTime()
      await this.refreshAgendaStatus()
    }, 5000)

    this.refreshTime()
    this.refreshAgendaStatus()
  }

  @Watch('device')
  deviceChCb () {
    this.selectedCapName = ''
    this.refreshTime()
    this.refreshAgendaStatus()
  }

  dbgConError(...e) {
    if (this.connected) { console.error(e) } else console.log(e)
  }

  async refreshTime () {
    this.deviceTimeInfo = await getTimeInfoForDevice(this.device).catch((e) =>
      this.dbgConError('time not avazilable on endpoint', e)
    )
  }

  async refreshAgendaStatus() {
    this.isAgendaInSync = !!await this.sm.isAgendaSync(this.device).catch((e) =>
      this.dbgConError('cant get agenda on endpoint', e))
  }

  askUpdateTime () {
    const ds = dateToStr(new Date())
    if (confirm('update time? to ' + ds)) {
      this.updateFromLocal()
    }
  }

  updateFromLocal () {
    const ds = dateToStr(new Date())
    console.log('sending date', ds)
    this.sm.setDeviceTimeStr(this.device, new Date())
    this.refreshTime()
  }

  get localTime () {
    if (!this.deviceTimeInfo || !this.deviceTimeInfo.localTime) {
      return 'no time'
    }
    return new Date(this.deviceTimeInfo.localTime).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    })
  }

  destroyed (): void {
    if (this._fetchTime) {
      clearTimeout(this._fetchTime)
    }
  }

  get sm (): ServerModel {
    return (this.$root as any).sm
  }

  get connected (): boolean {
    return this.sm.isDeviceConnected(this.getDevice().uuid)
  }

  get validCapNames () {
    return Object.keys(this.device.caps)
  }

  get selectedCapInstance () {
    return this.device.caps[this.selectedCapName]
  }

  get selectedCapType () {
    return this.selectedCapInstance?.type
  }

  get selectedCapComponentName () {
    if (this.selectedCapType === 'html') return 'HTMLCap'
    if (this.selectedCapType === 'osc') return 'OSCCap'
    console.error('invalid cap type', this.selectedCapType)
  }

  get selectedCapPort () {
    return this.selectedCapInstance?.port
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

  setName (): void {
    const gn = prompt('device name', this.getDevice().niceName)
    if (gn) {
      this.emitChange('niceName', gn)
      this.sm.setDeviceNiceName(this.device, gn)
    }
  }

  async setHostName(): Promise<void> {
    let hn = prompt(
      'set HostName ,\n !!!! Reboot after this !!!',
      this.device.deviceName
    )
    if (hn) {
      if (this.device.deviceName.startsWith('relay_') && !hn.startsWith('relay_')) { hn = 'relay_' + hn }
      if (this.device.deviceName.startsWith('lumestrio') && !hn.startsWith('lumestrio')) { hn = 'lumestrio' + hn }

      await this.sm.setDeviceHostName(this.device, hn)
      this.reboot()
    }
  }

  reboot () {
    const hn = confirm('!!!! Reboot Device ???')
    if (hn) {
      this.sm.rebootDevice(this.device)
    }
  }
}
</script>

<style scoped>
.notConnected {
  background: red;
  font-size: 5em;
}
</style>
