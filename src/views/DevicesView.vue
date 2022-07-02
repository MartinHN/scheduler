<template>
  <div class="devLiust">
    <!-- <input type='number' v-model=updateP /> -->
    <div class="row" v-if="sm.isAdminMode">
      <button @click="addDevice">Add Device</button>
      <button @click="removeDevice">Remove Device</button>
      <button @click="syncAllDeviceTimes">Sync horloges</button>
      <br />
    </div>
    <div v-for="v of unregisteredDevice" :key="v.id">
      {{ v }}<button @click="registerDevice(v.deviceName, v)">register</button>
    </div>
    <br />
    <div
      :style="{
        'max-height': selectedDeviceUUID && sm.isAdminMode ? '30vh' : '90vh',
        'overflow-y': 'auto',
      }"
    >
      <DeviceRow
        style="width: 100%"
        v-for="v of sortedKnownDevices"
        :key="v.id"
        :device="v"
        :selected="selectedDeviceUUID === v.uuid && sm.isAdminMode"
        @edit="showInfo(v.uuid)"
        @input="deviceChanged(v.uuid, $event)"
        @deviceEvent="sendDeviceEvent(v.uuid, $event)"
      />
    </div>
    <div class="devinfo" v-if="selectedDevice !== undefined && sm.isAdminMode">
      <span class="row">
        <div @click="showInfo()">{{ selectedDevice.deviceName }}</div>
        <div class="closeHeader" @click="showInfo()">X</div>
      </span>
      <DeviceInfo :device="selectedDevice" />
    </div>
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Prop, Vue } from 'vue-property-decorator'

import DeviceRow from '@/components/DeviceRow.vue'
import DeviceInfo from '@/components/DeviceInfo.vue'
import * as ServerAPI from '@/API/ServerAPI'
import { newEmptyDevice, Device, DeviceDic, Groups } from '@/API/ServerAPI'

// interface Devices{knownDevices:DeviceDic}

import { ServerModel } from '@/API/ServerModel'

@Component({
  components: {
    DeviceRow,
    DeviceInfo
  }
})
export default class DeviceViewComp extends Vue {
  // availableGroups = [] as Groups

  selectedDeviceUUID = '';

  mounted (): void {
    this.sm.requestServerInfo()
    this.sm.setDNSActive(true)
  }

  get sm (): ServerModel {
    return (this.$root as any).sm
  }

  get connectedDeviceList () {
    return this.sm.connectedDeviceList
  }

  get knownDevices () {
    return this.sm.knownDevices
  }

  sendDeviceEvent (uuid: string, o: any) {
    this.sm.sendDeviceEvent(uuid, o)
  }

  destroyed (): void {
    this.sm.setDNSActive(false)
  }

  syncAllDeviceTimes () {
    if (confirm('synchronize tout horloge')) {
      this.sm.syncAllDeviceTimes()
    }
  }

  get unregisteredDevice (): Device[] {
    return this.connectedDeviceList
      .slice()
      .filter((d) => this.knownDevices[d.uuid] === undefined)
  }

  get selectedDevice (): Device {
    return this.knownDevices[this.selectedDeviceUUID]
  }

  get selectedDeviceName (): string {
    return this.selectedDevice?.deviceName
  }

  get sortedKnownDevices () {
    const getS = (a: Device): string => {
      return (a.group ? a.group : 'aaaa') + a.niceName
    }
    return Object.values(this.knownDevices).sort((a, b) => {
      return getS(a).localeCompare(getS(b))
    })
  }

  async addDevice (): Promise<void> {
    const gn = prompt('device name', this.selectedDeviceName)
    if (gn) {
      this.registerDevice(gn, newEmptyDevice(gn))
    }
  }

  async registerDevice (name: string, d: Device): Promise<void> {
    await Vue.set(this.knownDevices, d.uuid, d)
    this.selectedDeviceUUID = d.uuid
    this.save()
  }

  async removeDevice (n: string): Promise<void> {
    const gn = prompt('device name', this.selectedDeviceName)
    const targetD = Object.values(this.knownDevices).find(
      (e) => e.deviceName === gn
    )
    if (targetD) {
      await Vue.delete(this.knownDevices, targetD.uuid)
      this.selectedDeviceUUID = ''
    } else {
      console.error('nothing to remove')
    }
    this.save()
  }

  deviceChanged (k: string, newD: any): void {
    // deffer for vue to be up to date
    setTimeout(() => {
      this.save()
    }, 0)
  }

  toggleInfo (uuid: string) {
    console.log('toggle info for ', uuid)
    if (this.selectedDeviceUUID && this.selectedDeviceUUID.length) {
      this.selectedDeviceUUID = ''
    } else {
      this.selectedDeviceUUID = uuid
    }
  }

  showInfo (uuid = '') {
    this.selectedDeviceUUID = uuid
  }

  save (): void {
    ServerAPI.saveKnownDeviceDic(this.knownDevices)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.devinfo {
  background: black;
  position: fixed;
  bottom: 0px;
  min-height: 50vh;
}
.devinfo .closeHeader {
  min-height: 50px;
}
</style>
