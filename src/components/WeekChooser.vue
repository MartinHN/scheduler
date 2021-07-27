
<template>
  <div>

     <span style="display:grid;grid-template:1fr repeat(7,1fr)/1fr 3fr;font-size:1em;grid-gap:5px">

   <template v-for="(v,i) in value"   >

    <div :key="i.id"  >
      <div> {{i}}</div>
      <select   v-model="v.type" style=font-size:1em;>
          <option  v-if='i!=="default"' value="default" >default</option>
          <option value="no">off</option>
          <option value="custom">custom</option>
      </select>

    </div>
    <div :key="i.id"  :style="{display:'grid','grid-template-columns':'1fr auto',background:(v.type==='no'||(v.type==='default'&&value.default.type==='no'))?'red':''}">
     <HoursChooser v-if="v.type==='custom'" v-model=v.hourRange />

      <div v-else-if="v.type==='default'" style=align-self:center >{{(v.type==='default'&&value.default.type!=='no')?value.default.hourRange:'default'}}</div>

    </div>
   </template>
     </span>

  </div>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator'
import HoursChooser, { HourRange, defaultHourRange } from '@/components/HoursChooser.vue'

export interface DayType{
    type:string,
    hourRange:HourRange
  }

export function defaultDayType ():DayType {
  return { type: 'default', hourRange: defaultHourRange() }
}

export interface WeekHours{
  default:DayType
  lundi:DayType
  mardi:DayType
  mercredi:DayType
  jeudi:DayType
  vendredi:DayType
  samedi:DayType
  dimanche:DayType
}

export function defaultDefaultDay () {
  const res = defaultDayType()
  res.type = 'custom'
  return res
}

export function defaultWeekHour ():WeekHours {
  return {
    default: defaultDefaultDay(),
    lundi: defaultDayType(),
    mardi: defaultDayType(),
    mercredi: defaultDayType(),
    jeudi: defaultDayType(),
    vendredi: defaultDayType(),
    samedi: defaultDayType(),
    dimanche: defaultDayType()
  }
}
@Component({
  components: {
    HoursChooser
  }
})
export default class WeekChooser extends Vue {
  @Prop({ required: true })
  private value!:WeekHours

  defaultChanged (e:any):void {
    console.log('input', e)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
