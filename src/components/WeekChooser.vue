
<template>
  <div>
   <h1> week </h1>
     <span style="display:grid;grid-template:2fr repeat(7,1fr)/1fr 3fr;font-size:1em">
   <div> default</div ><HoursChooser  v-model="defaultHours" @input=defaultChanged />
   <template v-for="i in Object.keys(days)"   >

    <div :key="i.id"> {{i}}</div>
    <div :key="i.id" style="display:grid;grid-template-columns:1fr auto">
     <select v-model="days[i]" style=font-size:1.5em;>
        <option  value="default" >default</option>
        <option value="no">no</option>
        <option value="HH:mm">custom</option>
     </select>
     <HoursChooser v-if="days[i]!='no' && days[i]!='default'" v-model=days[i] /></div>
   </template>
     </span>

  </div>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator'
import HoursChooser from '@/components/HoursChooser.vue'

@Component({
  components: {
    HoursChooser
  }
})
export default class WeekChooser extends Vue {
  private defaultHours = { start: 'HH:mm', end: 'HH:mm' }
  private days = { lundi: 'default', mardi: 'default', mercredi: 'default', jeudi: 'default', vendredi: 'default', samedi: 'default', dimanche: 'default' }

  defaultChanged (e) {
    console.log('input', e)
  }

  setType (d, t) {
    this.days[d] = t
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
