<template>
  <div class="deviceRow">
    <button
      class="tab defaultItem"
      :class="{ notconnected: !connected, active: selected }"
    >
      <div
        class="nameContainer"
        style="margin-right:10px; "
      >
        <select
          :value="device.deviceType"
          name="type"
          @change="setType($event.target.value)"
        >
          <option
            v-for="v, k of LoraTypeNames"
            :key="v"
            :value="k"
          >
            {{ v }}
          </option>
        </select>
        <select
          :value="device.deviceNumber"
          name="type"
          @change="setNumber($event.target.value)"
        >
          <option
            v-for="v, k of loraDeviceNumbers"
            :key="v"
            :value="k"
          >
            {{ k }}
          </option>
        </select>
        <input
          class="textName"
          :value="device.deviceName"
          @change="setName($event.target.value)"
        >
        {{ }}
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

    <!-- <select
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
    </div> -->
    <div
      :style="{
        flex: '0.001 1 5em',
        borderRadius: '5px',
        background: !connected ? 'red' : 'inherit',
        color: parseInt(device.rssi) < -75 ? 'orange' : 'inherit',
      }"
    >
      {{ device._lastRoundtrip }}
    </div>
    <button @click="removeMe">
      delete
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Device, getRSSIFromDevice } from '@/API/ServerAPI'
import { ServerModel } from '@/API/ServerModel'
import { LoraDevice, LoraTypeNames, LoraDeviceInstance, maxDevicePerType } from '@/API/types/LoraDevice'
import { LoraState, DefaultLoraState } from '@/API/types/LoraState'
@Component({})
export default class LoraDeviceRow extends Vue {
  @Prop({ default: false }) selected!: boolean

  @Prop({ required: true }) device!: LoraDeviceInstance

  @Prop({ default: new DefaultLoraState() }) loraState!: DefaultLoraState

  fechtP = 2500
  // slowFechtP = 5000
  // fastFechtP = 2500
  // numFastPing = 0
  // delayToBeDead = 5 * 1000

  lastAsked = new Date()
  _fetchDev = undefined as any
  connected = true
  lastPingDtMs = 0
  // isAgendaInSync = false
  mounted() {
    // ask actual state without args
    // this.sm.sendDeviceEvent(this.device.uuid, { type: 'activate' })

    this._fetchDev = setTimeout(() => { this.fetchDeviceInfo() }, Math.random() * 500)
    this.connected = false
  }

  destroyed(): void {
    if (this._fetchDev) {
      clearTimeout(this._fetchDev)
    }
  }

  get sm(): ServerModel {
    return (this.$root as any).sm
  }

  get LoraTypeNames() {
    return LoraTypeNames
  }

  get loraDeviceNumbers() {
    return Array.from(Array(maxDevicePerType + 1).keys()).slice(1)
  }

  get isAdminMode() {
    return this.sm.isAdminMode
  }

  get niceName() {
    return LoraTypeNames[this.device.deviceType] + '' + this.device.deviceNumber
  }
  // emitChange(k: string, v: any): void {
  //   const d = this.device as any
  //   d[k] = v
  //   this.$emit('input', d)
  // }

  setType(t) {
    this.device.deviceType = t >>> 0
    this.$emit('change', this.device)
  }

  setNumber(n) {
    this.device.deviceNumber = (n >>> 0)
    this.$emit('change', this.device)
  }

  setName(n) {
    this.device.deviceName = n
    this.$emit('change', this.device)
  }

  async removeMe() {
    const idx = this.sm.knownLoraDevices.findIndex(e => LoraDeviceInstance.getUuid(e))
    if (idx < 0) { console.error('no lora device to remove'); return }
    // await Vue.delete(this.sm.knownLoraDevices, idx)
    this.sm.knownLoraDevices.splice(idx, 1)
    this.$emit('change', this.device)
  }

  // edit(): void {
  //   this.$emit('edit', this.getDevice())
  // }

  // get isSynchronizing() {
  //   return this.isAdminMode && this.connected && !this.isAgendaInSync
  // }

  get minIntervalForBeingConnected() {
    return this.loraState.clockUpdateIntervalSec
  }

  fetchDeviceInfo(): void {
    if (this._fetchDev) clearTimeout(this._fetchDev)

    // console.log('fetching', this.device)
    const lastM = new Date(this.device._lastSeen).getTime()
    const dt = new Date().getTime() - lastM
    this.connected = dt < this.minIntervalForBeingConnected * 1000

    this.lastAsked = new Date()
    this._fetchDev = setTimeout(this.fetchDeviceInfo.bind(this), this.fechtP)
  }

  // setName ():void {
  //   const gn = prompt('device name', this.getDevice().niceName)
  //   if (gn) {
  //     this.emitChange('niceName', gn)
  //     this.sm.setDeviceNiceName(this.device, gn)
  //   }
  // }

  setOnOff(b: boolean): void {
    // if (!this.sm.isAgendaDisabled) {
    //   const msg = "L'agenda est encore actif et ne prendra pas en compte la commande\n voulez vous désactiver l'agenda?"
    //   if (confirm(msg)) { this.sm.isAgendaDisabled = true } else return
    // }
    this.sm.activateLoraDevice(this.device, b)
  }
}
</script>

<style scoped>
.defaultItem {
  flex: 1 1 30%;
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

.minIcon {
  max-height: 20px;
  margin: 0 5px 0 0;
  align-self: center;
}

.textName {
  overflow-wrap: anywhere;
  text-align: left;
  justify-content: flex-start;
  align-items: center;
  white-space: nowrap;
}

.tab {
  flex-shrink: 0;
}

.nameContainer {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
</style>
