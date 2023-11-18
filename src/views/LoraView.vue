<template>
  <div class="main">
    <div class="header">
      <div style="display: flex;">
        <button
          :class="{ active: state.isMasterClock }"
          @click="state.isMasterClock = !state.isMasterClock; doSave()"
        >
          isMasterClock
        </button>
        <input
          v-if="state.isMasterClock"
          :value="state.clockUpdateIntervalSec"
          @change="setClockInterval($event.target.value)"
        >
        <button
          :class="{ active: sm.loraIsSendingPing }"
          @click="setIsSendingTest(!sm.loraIsSendingPing, true)"
        >
          Test
        </button>
        <input
          v-if="sm.loraIsSendingPing"
          :value="state.pingUpdateIntervalSec"
          @change="setPingInterval($event.target.value)"
        >
        <button
          :class="{ active: sm.loraIsSyncingAgendas }"
          @click="setIsSyncingAgendas(!sm.loraIsSyncingAgendas)"
        >
          Sync Ag
        </button>
        <button
          :class="{ active: sm.loraIsCheckingAgendas }"
          @click="setIsCheckingAgendas(!sm.loraIsCheckingAgendas)"
        >
          Check Ag
        </button>
        <button
          :class="{ active: sm.loraIsDisablingWifi }"
          @click="setDisablingWifi(!sm.loraIsDisablingWifi)"
        >
          DisableWifi
        </button>
      </div>
      <div class="loraChannelCtls">
        <div class="loraCtl">
          <div>Channel</div>
          <select
            :value="state.channel"
            @change="state.channel = $event.target.value"
          >
            <option
              v-for="(hz, i) of chanToHzTable"
              :key="i"
              :value="i"
            >
              {{ "" + i + ": " + hz }}MHz
            </option>
          </select>
        </div>
        <div class="loraCtl">
          <div>speed</div>

          <select
            :value="state.speed"
            @change="state.speed = $event.target.value"
          >
            <option
              v-for="(r, i) of airDataRates"
              :key="i"
              :value="i"
            >
              {{ "" + i + ": " + r }}kbps
            </option>
          </select>
        </div>
        <button
          class="loraCtl"
          :class="{ active: state.fec }"
          @click="state.fec = !state.fec;"
        >
          fec
        </button>
        <button
          class="loraCtl"
          @click=" doSave()"
        >
          Apply Changes
        </button>
        <button
          class="loraCtl"
          :class="{ active: state.isActive }"
          @click="state.isActive = !state.isActive; doSave()"
        >
          isActive
        </button>
      </div>

      <div
        :style="{ display: 'flex' }"
        flexBasis="50%"
      >
        <button @click="addLoraDevice">
          + Add device
        </button>
        <button @click="removeAllLora">
          removeAll
        </button>
      </div>
    </div>
    <div class="list">
      <LoraDeviceRow
        v-for="v, i of loraDevices"
        :key="i"
        :lora-state="state"
        :device="v"
        @change="saveDevices"
      >
        {{ i }}
      </LoraDeviceRow>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import * as HTTPAPI from '@/API/HTTPAPI'
import * as ServerAPI from '@/API/ServerAPI'

import { ServerModel } from '@/API/ServerModel'
import { DefaultLoraState, chanToHzTable, airDataRates, minClockUpdateInterval, minPingUpdateInterval } from '@/API/types/LoraState'
import LoraDeviceRow from '@/components/LoraDeviceRow.vue'
import { LoraDevice, LoraDeviceInstance } from '@/API/types/LoraDevice'

@Component({
  components: { LoraDeviceRow }
})
export default class LoraView extends Vue {
  public state = new DefaultLoraState()

  public get chanToHzTable() { return chanToHzTable }
  public get airDataRates() { return airDataRates }
  get sm(): ServerModel {
    return (this.$root as any).sm
  }

  get loraDevices() {
    return this.sm.knownLoraDevices
  }

  async mounted(): Promise<void> {
    Object.assign(this.state, await ServerAPI.getLoraState())
    await ServerAPI.getKnownLoraDevices().then(dl => {
      this.sm.knownLoraDevices.length = 0
      if (dl) { Object.values(dl).map(e => this.sm.knownLoraDevices.push(LoraDeviceInstance.create(e))) }
      console.log('got known lora devices', this.sm.knownLoraDevices)
      if (localStorage) {
        this.setIsSendingTest(localStorage.getItem('isSengdingLoraPing') === '1')
      }
    })
  }

  destroyed(): void {
    this.setIsSendingTest(false, false)
  }

  setClockInterval(e) {
    console.log('got', e)
    let ci = parseFloat(e)
    if (ci < minClockUpdateInterval) {
      console.error('can not set small times', ci, e)
      ci = minClockUpdateInterval
    }
    this.state.clockUpdateIntervalSec = ci
    ServerAPI.saveLoraState(this.state)
  }

  setPingInterval(e) {
    console.log('got', e)
    let ci = parseFloat(e)
    if (ci < minPingUpdateInterval) {
      console.error('can not set small times', ci, e)
      ci = minClockUpdateInterval
    }
    this.state.pingUpdateIntervalSec = ci
    ServerAPI.saveLoraState(this.state)
  }

  setIsSendingTest(b, save = true) {
    this.sm.setLoraTestEnabled(b)
    if (save && localStorage) { localStorage.setItem('isSengdingLoraPing', b ? '1' : '0') }
  }

  setIsSyncingAgendas(b: boolean) {
    this.sm.setLoraIsSyncingAgendas(!!b)
  }

  setIsCheckingAgendas(b: boolean) {
    this.sm.setLoraIsCheckingAgendas(!!b)
  }

  setDisablingWifi(b: boolean) {
    this.sm.setLoraIsDisablingWifi(!!b)
  }

  doSave(): void {
    ServerAPI.saveLoraState(this.state)
  }

  addLoraDevice() {
    this.sm.knownLoraDevices.push(new LoraDeviceInstance())
    this.saveDevices()
  }

  async saveDevices() {
    console.log('saving ', this.loraDevices)
    await ServerAPI.setKnownLoraDevices(this.loraDevices)
    await this.sm.loadLoraDevices()
  }

  async removeAllLora() {
    if (!confirm('sur de vouloir supprimer tout les appareils Lora??')) return
    this.sm.knownLoraDevices.length = 0
    this.saveDevices()
  }
}
</script>

      <!--Add "scoped" attribute to limit CSS to this component only-->
<style scoped>
div.grouplist {
  /* overflow-y: auto; */
  max-height: 700px;
  position: sticky;
  align-self: flex-start;
  top: calc(var(--nav-header-h) - var(--btn-h));
}

.loraChannelCtls{
  display: flex;
  flex-wrap:wrap;
}
.loraChannelCtls *{
  flex:1 1 50%;
  flex-wrap: wrap;
}

.loraCtl{
  flex: 1 0 20vw;
  display: flex;
  flex-wrap: nowrap;
  flex-direction: column;
  align-content: center;
  justify-content: center;
}

.header {
  display: grid;
  margin-top:15px;
  grid-template: 1fr/100%;
  grid-gap: 10px;
}
.list {
  display: grid;
  margin-top:15px;
  grid-template: 1fr/100%;
  grid-gap: 5px;
}
</style>
