<template>
  <div class="group chooser" style='display:grid;grid-template-columns="1Fr 1Fr"'>
      <select style=width:100% v-model=currentAgendaName @change="loadFromFile($event.target.value)">
          <option style=width:100% v-for="v of agendaNames" :key=v.id :value=v>{{v}}</option>
      </select>

            <div style="display:grid;grid-template-columns:repeat(2,1fr);grid-gap:5px">
      <button class=flash @click="saveAgendaToFile">save or Add Agenda</button>
      <button class=flash @click="eraseAgendaFile">erase Agenda</button>
      <!-- <button @click="loadFromFile">load from File</button> -->
      <!-- <button @click="saveToDevice">save To Device</button>
      <button @click="loadFromDevice">load from Device</button> -->
      </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { AgendaFile } from '@/API/ServerAPI'
import * as ServerAPI from '@/API/ServerAPI'

function replaceJSON (k : string, v : any) : any {
  if (v.type === 'default') {
    return undefined
  }
  return v
}

function getPruned (v:AgendaFile):any {
  const agendas = JSON.parse(JSON.stringify(v.agendas, replaceJSON)) // as AgendaZones
  agendas.default.dates = undefined

  return { agendas }
}
@Component({})
export default class AgendasList extends Vue {
    @Prop({ required: true })
    currentAgendaData !: AgendaFile;

    currentAgendaName = ''
    agendaNames = new Array<string>()
    localFiles : {[key: string] : AgendaFile} = {};

    // get prunedFileData ():any {
    //   return getPruned(this.currentAgendaData)
    // //   return JSON.parse(JSON.stringify(this.currentAgendaData, replaceJSON))
    // }

    mounted (): void{ this.updateAvailableAgendas() }

    async updateAvailableAgendas (): Promise<void> {
      const data = await ServerAPI.getAgendaNames()
      if (data !== undefined) {
        Vue.set(this, 'agendaNames', data)
      }

      if (!this.currentAgendaName) {
        this.currentAgendaName = this.agendaNames[0]
        console.log('forcing currentAgendaName', this.currentAgendaName)
        this.loadAgendaNamed(this.currentAgendaName)
      }
    }

    async saveAgendaToFile () : Promise<string[]> {
      const name = prompt('file name', this.currentAgendaName)
      if (name) {
        ServerAPI.saveAgenda(name, this.currentAgendaData)
        await this.updateAvailableAgendas()
        this.currentAgendaName = name
      }

      return []
    }

    async eraseAgendaFile ():Promise<void> {
      const name = this.currentAgendaName
      ServerAPI.deleteAgenda(name)
      this.updateAvailableAgendas()
      this.loadAgendaNamed(this.agendaNames[0])
    }

    async loadAgendaNamed (name:string) :Promise<void> {
      if (!name) { console.error('nofile to load'); return }
      console.log('load', name)
      const savedFile = ServerAPI.getAgenda(name)
      if (savedFile) {
        this.$emit('input', savedFile)
        this.currentAgendaName = name
      }
    }

    async saveAllAgendasToDevice ():Promise<void> {
      for (const [k, v] of Object.entries(this.localFiles)) {
        await ServerAPI.saveAgenda(k, v)
      }
      this.updateAvailableAgendas()
      //   console.log('save', JSON.parse(JSON.stringify(this.currentAgendaData, replaceJSON)))
    }
}
</script>

    <!--Add "scoped" attribute to limit CSS to this component only-->
<style scoped></style>
