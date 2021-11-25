<template>
<div>
  <br>
<div class=row>
   <div class=wmin> Liste des agendas </div><AgendasList  />
</div>
<br><br>
    <AgendaEditor v-if=!!editedAgenda :agenda=editedAgenda @input=saveCurrent />

</div>

</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Prop, Vue } from 'vue-property-decorator'
import AgendaEditor from '@/components/AgendaEditor.vue'

import AgendasList from '@/components/AgendasList.vue'
import { Agenda } from '@/API/ServerAPI'
import { ServerModel } from '@/API/ServerModel'
import * as ServerAPI from '@/API/ServerAPI'

@Component({
  components: {
    AgendaEditor,
    AgendasList
  }
})
export default class AgendasView extends Vue {
  get sm ():ServerModel { return (this.$root as any).sm }
  get connectedDeviceList () { return this.sm.connectedDeviceList }
  get knownDevices () { return this.sm.knownDevices }
  get agendasNames () { return this.sm.agendaFileNames }
  get editedAgenda ():Agenda|null{ return this.sm.loadedAgenda }

  get editedAgendaName ():string {
    return this.editedAgenda?.name || 'none'
  }

  agendaFileNames :string[]=[]

  // get agendaNameSorted ():string[] {
  //   if (!this.agendas) { return [] }
  //   return Object.keys(this.agendas).sort((a:string, b:string) => { return (this.agendas[a].dates.start.getTime && this.agendas[a].dates.start.getTime()) - (this.agendas[b].dates.start.getTime && this.agendas[b].dates.start.getTime()) })
  // }

  removeAgenda ():void {
    // this.agendas[this.editedAgenda] = (null as unknown as Agenda)
    // Vue.delete(this.agendas, this.editedAgenda)
    // this.editedAgenda = 'default'
  }

  setAgendaName (n:string):void{
    // console.log(n)

    // console.log('setting agenda name', n)
    // Vue.set(this.agendas, n, this.agendas[this.editedAgenda])
    // Vue.delete(this.agendas, this.editedAgenda)
    // this.editedAgenda = n
  }

  saveCurrent () {
    // deffer for vue to be up to date
    setTimeout(() => {
      if (!this.sm._hasLoadedFirst) {
        console.warn(' soon to save?') // bug with early change triggered
        return
      }
      if (this.editedAgenda) {
        console.log(this.editedAgenda)
        ServerAPI.saveAgenda(this.editedAgenda.name + '.json', this.editedAgenda)
      } else {
        console.error('invalid agenda', this.editedAgenda)
      }
    }, 0)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
