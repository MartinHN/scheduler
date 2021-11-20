
<template>
  <div>

      <div >

        <DayEditor style=background:gray v-model=value.defaultDay  @input="$emit('input',value)" />
        <h1> Exceptions </h1>
              Ajout jour <select @change=addException($event.target.value) >
                 <option v-for="d of availableDays" :key=d.id >{{d}}</option>
               </select>
            <div v-for="v of exceptionList" :key=v.id>
              <div class=exceptionTable>
                <div>{{v.dayName}}</div>
                <DayEditor  :value="v" @input="$emit('input',value)" />
               <button  @click=removeException(v.dayName) style="background:red"> <img src="img/trash.svg"  /></button>
              </div>
            </div>

    </div>
  </div>

</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Prop, Vue } from 'vue-property-decorator'

import { WeekHours, ExceptionList } from '@/API/ServerAPI'
import DayEditor from './DayEditor.vue'
import * as ServerAPI from '@/API/ServerAPI'

@Component({
  components: {
    DayEditor
  }
})
export default class WeekEditor extends Vue {
   @Prop({ required: true })
   value !:WeekHours

   // mounted ():void {

   // }

   get availableDays () :string[] {
     return ServerAPI.getAvailableExceptionDaysFromWH(this.value)
   }

   get exceptionList ():ExceptionList {
     return ServerAPI.getExceptionListFromWH(this.value).sort((a, b) => ServerAPI.dayNames.indexOf(a.dayName) - ServerAPI.dayNames.indexOf(b.dayName))
   }

   async addException (d:string):Promise<void> {
     if (ServerAPI.dayNames.includes(d)) {
       const dd = ServerAPI.createDefaultDayType()
       dd.dayName = d
       await this.value.exceptions.push(dd)
     } else {
       console.error('invalid day name', d)
     }
     this.$emit('input', this.value)
   }

   async removeException (d:string) :Promise<void> {
     if (ServerAPI.dayNames.includes(d)) {
       const idx = this.value.exceptions.findIndex(e => e.dayName === d)
       if (idx >= 0) { this.value.exceptions.splice(idx, 1) }
     } else {
       console.error('invalid day name', d)
     }
     this.$emit('input', this.value)
   }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.exceptionTable{
  background: black;
  border: 1px solid black;
  display:grid;
  grid-template-columns:1fr 7fr 1fr;
  grid-gap:1px 1px;
}
.exceptionTable > * {
  background:grey;
  padding:0px;
}
</style>
