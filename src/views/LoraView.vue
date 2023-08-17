<template>
  <div class="config">
    <button
      :class="{ active: state.isActive }"
      @click="state.isActive = !state.isActive; doSave()"
    >
      isActive
    </button>
    <button
      :class="{ active: state.isMasterClock }"
      @click="state.isMasterClock = !state.isMasterClock; doSave()"
    >
      isMasterClock
    </button>
    <div>
      Lora unique address
      <select
        :value="state.uuid"
        @change="state.uuid = $event.target.value"
      >
        <option
          v-for="(uuid) of loraUuids"
          :key="uuid"
          :value="uuid"
        >
          {{ uuid }}
        </option>
      </select>
    </div>
    <div>
      Channel
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
    <div>
      speed
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
      <button
        :class="{ active: state.fec }"
        @click="state.fec = !state.fec;"
      >
        fec
      </button>
      <button
        @click=" doSave()"
      >
        Apply Changes
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import * as HTTPAPI from '@/API/HTTPAPI'
import * as ServerAPI from '@/API/ServerAPI'

import { ServerModel } from '@/API/ServerModel'
import { DefaultLoraState, chanToHzTable, airDataRates, loraUuids } from '@/API/types/LoraState'

@Component({
  components: {}
})
export default class LoraView extends Vue {
  public state = new DefaultLoraState()

  public get chanToHzTable() { return chanToHzTable }
  public get airDataRates() { return airDataRates }
  public get loraUuids() { return loraUuids }

  get sm(): ServerModel {
    return (this.$root as any).sm
  }

  async mounted(): Promise<void> {
    Object.assign(this.state, await ServerAPI.getLoraState())
  }

  doSave(): void {
    ServerAPI.saveLoraState(this.state)
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

.main {
  display: grid;
  grid-template-columns: 1fr 3fr;
  grid-gap: 15px;
}
</style>
