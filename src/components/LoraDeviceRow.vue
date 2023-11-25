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
        <div v-if="editable">
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
            ref="nameInput"
            class="textName"
            :value="device.deviceName"
            @input="setName($event.target.value)"
          >
        </div>
        <div v-else>
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
              {{ device.deviceName }}
            </div>
          </div>
        </div>
      </div>
    </button>

    <button
      ref="onoff"
      class="defaultItem"
      :style="{ minWidth: editable ? '5vw' : '15vw', flexBasis: editable ? '1vw' : '15vw', background: device._isActive ? 'green' : 'gray' }"
      :disabled="!!(btnDisableTimeout)"
      @click="setOnOff(!device._isActive)"
    >
      {{ sm.isAgendaDisabled ? "Turn " : "" }}{{ (device._targetActiveLoraValue !== null && device._isActive != device._targetActiveLoraValue) ? "..." : (device._isActive ? "Off" : "On") }}
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
        color: hasRecentMessage ? 'yellow' : 'inherit',
      }"
    >
      {{ device._lastRoundtrip }} <br>
      {{ isAgendaInSyncStr }}
    </div>
    <button
      v-if="editable"
      class="deleteBtn"
      @click="removeMe"
    >
      delete
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

// import { Device, getRSSIFromDevice } from '@/API/ServerAPI'
import { ServerModel } from '@/API/ServerModel'
import { LoraDevice, LoraTypeNames, LoraDeviceInstance, maxDevicePerType, LoraDeviceType } from '@/API/types/LoraDevice'
import { LoraState, DefaultLoraState, getTotalPingTimeRoundTrip } from '@/API/types/LoraState'
@Component({})
export default class LoraDeviceRow extends Vue {
  @Prop({ default: false }) selected!: boolean
  @Prop({ default: true }) editable!: boolean

  @Prop({ required: true }) device!: LoraDeviceInstance

  @Prop({ default: () => { return new DefaultLoraState() } }) loraState!: DefaultLoraState

  updateDevInterval = 500
  // slowFechtP = 5000
  // fastFechtP = 2500
  // numFastPing = 0
  // delayToBeDead = 5 * 1000

  hasRecentMessage = false
  _fetchDev = undefined as any
  _keepPingAlive = undefined as any
  connected = true
  lastPingDtMs = 0
  btnDisableTimeout = null as any

  isEditingName = false
  editedDevName = ''
  // isAgendaInSync = false
  mounted() {
    // ask actual state without args
    // this.sm.sendDeviceEvent(this.device.uuid, { type: 'activate' })

    this._fetchDev = setTimeout(() => { this.updateDeviceInfo() }, Math.random() * 500)
    this.sm.sendKeepPingingDevice(this.device, true)
    this._keepPingAlive = setInterval(() => { this.sm.sendKeepPingingDevice(this.device, true) }, 3000 + Math.random() * 500)
    this.connected = false
    this.editedDevName = this.device.deviceName
  }

  destroyed(): void {
    if (this._fetchDev) { clearTimeout(this._fetchDev) }
    if (this._keepPingAlive) { clearInterval(this._keepPingAlive) }
    this.sm.sendKeepPingingDevice(this.device, false)
  }

  get sm(): ServerModel {
    return (this.$root as any).sm
  }

  get groupNames() {
    return Object.keys(this.sm.groups)
  }

  get devNumReadable() {
    return (this.device.deviceNumber >> 0) > 0 ? this.device.deviceNumber : '?'
  }

  // setIsEditingName(b) {
  //   console.warn('editing ev', b)
  //   this.isEditingName = !!b
  // }

  // @Watch('device')
  // setVisibleName() {
  //   if (!this.isEditingName) { this.editedDevName = this.device.deviceName }
  // }

  get shortDevName() {
    let res = ''
    const t = this.device.deviceType
    if (t === LoraDeviceType.Relaystrio) { res += 'R' }
    if (t === LoraDeviceType.Lumestrio) { res += 'L' }

    res += this.devNumReadable
    return res
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

  get isAgendaInSync() {
    return this.device._isAgendaInSync
  }

  get isAgendaInSyncStr() {
    return this.isAgendaInSync ? 'agendOk' : '?'
  }
  // emitChange(k: string, v: any): void {
  //   const d = this.device as any
  //   d[k] = v
  //   this.$emit('input', d)
  // }

  setType(t) {
    this.device.deviceType = t >>> 0
    this.device._lastSeen = new Date(0)
    this.$emit('change', this.device)
  }

  setNumber(n) {
    this.device.deviceNumber = (n >>> 0)
    this.device._lastSeen = new Date(0)
    this.$emit('change', this.device)
  }

  setName(n) {
    // this.editedDevName = n
    this.device.deviceName = n
    this.emitChange('deviceName', n)
    // this.$emit('change', this.device)
  }

  async removeMe() {
    if (!confirm('sur de vouloir supprimer cet appareils Lora??\n' + this.device.deviceName + '\n' + this.shortDevName)) return
    const uuid = LoraDeviceInstance.getUuid(this.device)
    const idx = this.sm.knownLoraDevices.findIndex(e => { return uuid === LoraDeviceInstance.getUuid(e) })
    if (idx < 0) { console.error('no lora device to remove'); return }
    // await Vue.delete(this.sm.knownLoraDevices, idx)
    this.sm.knownLoraDevices.splice(idx, 1)
    this.$emit('change', this.device)
  }

  emitChange(k, v): void {
    const d = this.device
    d[k] = v
    this.$emit('change', d)
  }

  // edit(): void {
  //   this.$emit('edit', this.getDevice())
  // }

  // get isSynchronizing() {
  //   return this.isAdminMode && this.connected && !this.isAgendaInSync
  // }

  get minIntervalForBeingConnected() {
    return 2 * getTotalPingTimeRoundTrip(this.loraState.pingUpdateIntervalSec * 1000, this.sm.knownLoraDevices.length)
  }

  updateDeviceInfo(): void {
    if (this._fetchDev) clearTimeout(this._fetchDev)

    // console.log('fetching', this.device)
    const lastSeenTime = new Date(this.device._lastSeen).getTime()
    const now = new Date().getTime()
    const dt = now - lastSeenTime
    this.hasRecentMessage = (dt < 800)
    this.connected = (dt <= this.minIntervalForBeingConnected)
    if (this.device._targetActiveLoraValue !== null) {
      if ((this.device._isActive !== this.device._targetActiveLoraValue) && (this.btnDisableTimeout === null)) {
        this.btnDisableTimeout = setTimeout(() => { this.btnDisableTimeout = undefined }, 3000)
      } else if (this.btnDisableTimeout) {
        if (this.device._isActive === this.device._targetActiveLoraValue) {
          clearTimeout(this.btnDisableTimeout)
          this.btnDisableTimeout = null
        }
      }
    }
    this._fetchDev = setTimeout(this.updateDeviceInfo.bind(this), this.updateDevInterval)
  }

  // setName ():void {
  //   const gn = prompt('device name', this.getDevice().niceName)
  //   if (gn) {
  //     this.emitChange('niceName', gn)
  //     this.sm.setDeviceNiceName(this.device, gn)
  //   }
  // }

  setOnOff(b: boolean): void {
    if (!this.sm.isAgendaDisabled) {
      const msg = "L'agenda est encore actif et ne prendra pas en compte la commande\n voulez vous désactiver l'agenda?"
      if (confirm(msg)) { this.sm.setAgendaDisabled(true) } else return
    }

    this.sm.activateLoraDevices([this.device], b)
  }
}
</script>

<style scoped>
.defaultItem {
  flex: 1 1 20%;
}
.deleteBtn {
  flex: 1 1 10px;
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
