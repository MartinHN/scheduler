<template>
  <div class="group chooser row">
    <button
      id="agendaSync"
      :style="{}"
      @click="showModal(true)"
    >
      syncroniser l'agenda
    </button>
    <dialog
      ref="fullDial"
      class="myDialog"
    >
      <div
        ref="innerDial"
        class="myDiv"
      >
        <!-- <h1
          v-for="s of wifiStatus"
          :key="s"
        >
          {{ wifiStatusList[0] }}
        </h1> -->
        <h1 class="rawText">
          {{ lastWifiStatus }}
        </h1>
        <h1 class="rawText">
          {{ lastLoraStatus }}
        </h1>
      </div>
    </dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import { Agenda } from '@/API/ServerAPI'
import * as ServerAPI from '@/API/ServerAPI'
import { ServerModel } from '@/API/ServerModel'

@Component({})
export default class AgendasSync extends Vue {
  get sm(): ServerModel {
    return (this.$root as any).sm
  }

  get agendaNames(): string[] {
    return this.agendaFileNames.map((e) => e.replace('.json', ''))
  }

  get agendaFileNames(): string[] {
    return this.sm.agendaFileNames
  }

  showDialog = false

  get serverStatus() {
    return this.sm.serverSyncStatus
  }

  // wifiStatusList = new Array<string>()
  // get wifiStatus() {
  //   if (this.serverStatus.startsWith('[wifi]')) { this.wifiStatusList.push(this.serverStatus) }
  //   while (this.wifiStatusList.length > 10) { this.wifiStatusList = this.wifiStatusList.slice(1) }
  //   return this.wifiStatusList
  // }

  lastWifiStatus = ''
  lastLoraStatus = ''

  @Watch('serverStatus')
  updateLastStatus() {
    if (this.serverStatus.startsWith('[lora]')) { this.lastLoraStatus = this.serverStatus }
    if (this.serverStatus.startsWith('[wifi]')) { this.lastWifiStatus = this.serverStatus }
  }

  // get lastWifiStatus() {
  //   if (this.serverStatus.startsWith('[wifi]')) { return this.serverStatus }
  //   return ''
  // }

  // get lastLoraStatus() {
  //   if (this.serverStatus.startsWith('[lora]')) { return this.serverStatus }
  //   return ''
  // }

  // get prunedFileData ():any {
  //   return getPruned(this.currentAgendaData)
  // //   return JSON.parse(JSON.stringify(this.currentAgendaData, replaceJSON))
  // }

  mounted(): void {
    console.log('')

    const d = this.$refs.fullDial as HTMLDialogElement
    d.addEventListener('click', (event) => {
      event.preventDefault()
      this.showModal(false)
    })
    const id = this.$refs.innerDial as HTMLDialogElement
    id.addEventListener('click', (event) => {
      event.stopPropagation()
    })
  }

  showModal(b: boolean) {
    const d = this.$refs.fullDial as any
    this.sm.startFullAgSync(b)
    if (b) {
      d.showModal()
    } else { d.close() }
  }
}
</script>

    <!--Add "scoped" attribute to limit CSS to this component only-->
<style scoped>
.myDialog {
  width: 80vw;
  height: 80vh;
  padding: 0;
}

.myDiv {
  width: 100%;
  height: 100%;
  padding: 1rem;
}

.rawText {
  white-space: pre-wrap;
}

.group {
  justify-content: left;
  gap: 10px;
}

#agendaBtn:not(.active) {
  background: green;
}
</style>
