<template>
  <div class="group chooser row">
    <button id=agendaBtn
      :class="{ active: sm.isAgendaDisabled }"
      :value="sm.isAgendaDisabled"
      @click="sm.setAgendaDisabled(!sm.isAgendaDisabled)"
      :style="{ background: sm.isAgendaDisabled ? 'red' : '' }"
    >
      Agenda {{sm.isAgendaDisabled?"inactif":"actif"}}
    </button>
    <select
      style="width: 100%"
      :value="currentAgendaName"
      @change="loadAgendaNamed($event.target.value)"
    >
      <option
        style="width: 100%"
        v-for="v of agendaNames"
        :key="v.id"
        :value="v"
      >
        {{ v }}
      </option>
    </select>

    <button class="flash wmin" @click="saveAgendaToFile">
      sauver ou ajouter Agenda
    </button>
    <button class="flash wmin" @click="eraseAgendaFile">effacer Agenda</button>

    <!-- <button @click="loadFromFile">load from File</button> -->
    <!-- <button @click="saveToDevice">save To Device</button>
      <button @click="loadFromDevice">load from Device</button> -->
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Agenda } from '@/API/ServerAPI'
import * as ServerAPI from '@/API/ServerAPI'
import { ServerModel } from '@/API/ServerModel'

function replaceJSON (k: string, v: any): any {
  if (v.type === 'default') {
    return undefined
  }
  return v
}

@Component({})
export default class AgendasList extends Vue {
  get currentAgendaName (): string {
    console.log('>>>> get', this.sm.loadedAgenda?.name)
    return this.sm.loadedAgenda?.name || ''
  }

  get sm (): ServerModel {
    return (this.$root as any).sm
  }

  get agendaNames (): string[] {
    return this.agendaFileNames.map((e) => e.replace('.json', ''))
  }

  get agendaFileNames (): string[] {
    return this.sm.agendaFileNames
  }

  // get prunedFileData ():any {
  //   return getPruned(this.currentAgendaData)
  // //   return JSON.parse(JSON.stringify(this.currentAgendaData, replaceJSON))
  // }

  mounted (): void {
    this.loadFirstAvailableAgenda()
  }

  async loadFirstAvailableAgenda (): Promise<void> {
    if (!this.currentAgendaName) {
      const toLoad = this.agendaFileNames[0]
      console.log('forcing currentAgendaName', toLoad)
      this.loadAgendaNamed(toLoad)
    }
  }

  async saveAgendaToFile (): Promise<string[]> {
    const name = prompt('file name', this.currentAgendaName)
    if (name) {
      this.sm.loadedAgenda.name = name
      await ServerAPI.saveAgenda(name, this.sm.loadedAgenda)
      await this.sm.loadAgendaNames()
      await this.loadAgendaNamed(name)
    }

    return []
  }

  async eraseAgendaFile (): Promise<void> {
    const name = prompt("effacer l'agenda", this.currentAgendaName)
    if (name) {
      await this.sm.deleteAgenda(name)
      await this.loadFirstAvailableAgenda()
      this.loadAgendaNamed(this.agendaNames[0])
    }
  }

  async loadAgendaNamed (name: string): Promise<void> {
    if (!name) {
      console.error('nofile to load')
      return
    }
    let fileName = name
    if (!fileName.endsWith('.json')) {
      fileName = fileName + '.json'
    }
    console.log('load Agenda ', fileName)
    await this.sm.loadAgendaFromFile(fileName)
  }
}
</script>

    <!--Add "scoped" attribute to limit CSS to this component only-->
<style scoped>
.group {
  justify-content: left;
  gap: 10px;
}
#agendaBtn:not(.active){
  background:green;
}
</style>
