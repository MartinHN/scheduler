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
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import * as HTTPAPI from '@/API/HTTPAPI'
import * as ServerAPI from '@/API/ServerAPI'

import { Group, Groups, Device } from '@/API/ServerAPI'

import GroupList from '@/components/GroupList.vue'
import DeviceRow from '@/components/DeviceRow.vue'
import { ServerModel } from '@/API/ServerModel'
import { DefaultLoraState } from '@/API/types/LoraState'
@Component({
  components: {}
})
export default class LoraView extends Vue {
  public state = new DefaultLoraState()
  get sm(): ServerModel {
    return (this.$root as any).sm
  }

  async mounted(): Promise<void> {
    Object.assign(this.state, await ServerAPI.getLoraState())

    //     if (!this.currentGroupName && Object.keys(this.groups).length > 0) {
    //   const firstName = Object.keys(this.groups)[0]
    //   console.log('forcing currentGroup to', firstName)
    //   this.loadGroupNamed(firstName)
    // }
  }

  doSave(): void {
    ServerAPI.saveLoraState(this.state)
  }

  // async downloadState() {
  //   const state = await ServerAPI.getState()
  //   console.log('got state', state)
  //   const dataStr =
  //     'data:text/json;charset=utf-8,' +
  //     encodeURIComponent(JSON.stringify(state))
  //   const dob = document.getElementById('downloadState')
  //   if (dob) {
  //     dob.setAttribute('href', dataStr)
  //     dob.setAttribute('download', 'state.json')
  //     dob.click()
  //   }
  // }

  // async uploadState(e) {
  //   const file = e.target.files[0]
  //   console.log('uploading state', file)
  //   const fileReader = new FileReader()
  //   fileReader.addEventListener('load', (event: any) => {
  //     console.log('sending state')
  //     ServerAPI.saveState(JSON.parse(event.target.result))
  //   })
  //   fileReader.readAsText(file)
  //   // await ServerAPI.setState(a)
  // }
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
