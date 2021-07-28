<template>
  <div>

      <AgendasList :currentAgendaData="{agendas}" @input=loadNewJSON />
      <br>
      <div class="home" style="display: grid; grid-template-columns: 1fr 2fr;grid-gap:5px">

        <div style="overflow-y;outline-style: solid;outline-width:1px">
      <span style=display:flex>

      </span>
   <button  @click=addAgendaZone>add Agenda Exception</button>
      <div style=height:5px />

   <div style=display:flex v-for="z of agendasSorted" :key="z.id"  >
       <div style=width:20%  v-if='z===selectedAgenda' >   <button :key="z.id" v-if='z!=="default"' @click=removeAgenda>X</button> </div>
        <button
            type="radio"
            :key="z.id"
            @click="selectedAgenda = z"
            :class="{active:selectedAgenda===z}"
          >
            {{ z }}
          </button>
   </div>
        </div>
        <div v-if=agendas[selectedAgenda] style="display: grid; grid-template-rows: 1fr auto">
           <input v-if="selectedAgenda != 'default'" :value="selectedAgenda" @change="setAgendaName($event.target.value)"/>
          <PeriodChooser v-if="selectedAgenda != 'default'" v-model=agendas[selectedAgenda].dates />
          <WeekChooser v-model=agendas[selectedAgenda].weekHours />
        </div>
      </div>
    </div>

</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Prop, Vue } from 'vue-property-decorator'
import WeekChooser, { WeekHours, defaultWeekHour } from '@/components/WeekChooser.vue'

import PeriodChooser from '@/components/PeriodChooser.vue'
import AgendasList from '@/components/AgendasList.vue'
import { getJSON } from '@/API/API'

export interface AgendaZone{
  name:string
  dates:{start:Date, end:Date}
  weekHours:WeekHours
}

export interface AgendaZones {[id:string]: AgendaZone}

export interface FileType{
agendas: AgendaZones
}

const connection :any = {}

function createAgendaZone (name:string):AgendaZone {
  return {
    name,
    dates: {
      start: new Date(),
      end: new Date()
    },
    weekHours: defaultWeekHour()
  }
}

@Component({
  components: {
    WeekChooser,
    PeriodChooser,
    AgendasList
  }
})
export default class AgendasView extends Vue {
   a = 5;

   agendas :AgendaZones= { default: createAgendaZone('default') };
   selectedAgenda = 'default';

  agendaFileNames :string[]=[]
  mounted ():void {
    getJSON('agendaNames').then(data => {
      if (data !== undefined) {
        Vue.set(this, 'agendaFileNames', data)
      }
    })
  }

  get agendasSorted () {
    return Object.keys(this.agendas).sort((a:string, b:string) => { return (this.agendas[a].dates.start.getTime && this.agendas[a].dates.start.getTime()) - (this.agendas[b].dates.start.getTime && this.agendas[b].dates.start.getTime()) })
  }

  addAgendaZone ():void {
    const res = prompt('new exception agenda')
    if (typeof (res) === 'string') { Vue.set(this.agendas, res, createAgendaZone(res)); this.selectedAgenda = res }
  }

  removeAgenda ():void {
    // this.agendas[this.selectedAgenda] = (null as unknown as Agenda)
    Vue.delete(this.agendas, this.selectedAgenda)
    this.selectedAgenda = 'default'
  }

  loadNewJSON (f:FileType) : void{
    console.log('load new json file', f)
    this.agendas = f.agendas
  }

  setAgendaName (n:string):void{
    console.log(n)

    console.log('setting agenda name', n)
    Vue.set(this.agendas, n, this.agendas[this.selectedAgenda])
    Vue.delete(this.agendas, this.selectedAgenda)
    this.selectedAgenda = n
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.header{
  display:flex
}
</style>
