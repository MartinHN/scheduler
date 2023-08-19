<template>
  <div class="main">
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
    <div class="loraChannelCtls">
      <div class="loraCtl">
        <div>Lora unique address</div>

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
    </div>
    <button
      @click=" doSave()"
    >
      Apply Changes
    </button>
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

.loraChannelCtls{
  display: flex;
  flex-wrap:wrap;
}
.loraChannelCtls *{
  flex:1 1 50%;
  flex-wrap: wrap;
}

.loraCtl{
  flex: 1 0 25vw;
  display: flex;
  align-content: center;
  justify-content: center;
}

.main {
  display: grid;
  margin-top:15px;
  grid-template: 1fr/100%;
  grid-gap: 15px;
}
</style>
