<template>
  <div>
    <DeviceList style='display:none' :deviceList=deviceList />
    <div class=header >
      <div> {{!showGroups?"Time Zones":"Devices Group"}}</div>
      <button @click='showGroups=!showGroups' :value=showGroups> show {{!showGroups?"Devices Group":"Time Zones"}}</button>
    </div>
    <div v-if=showGroups>
      <GroupList :connectedDevices=deviceList  />
    </div>
    <div v-else>
      <ZonesList :currentZoneData="{zones}" @input=loadNewJSON />
      <br>
      <div class="home" style="display: grid; grid-template-columns: 1fr 2fr;grid-gap:5px">

        <div style="overflow-y;outline-style: solid;outline-width:1px">
      <span> <div @click=addZone>+</div>
        <div @click=removeZone>-</div>
      </span>
        <button
            type="radio"
            v-for="z of Object.keys(zones)"
            :key="z.id"
            @click="selectedZone = z"
            :class="{active:selectedZone===z}"
          >
            {{ z }}
          </button>
        </div>
        <div style="display: grid; grid-template-rows: 1fr auto">
          <PeriodChooser v-if="selectedZone != 'default'" v-model=zones[selectedZone].dates />
          <WeekChooser v-model=zones[selectedZone].weekHours />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Prop, Vue } from 'vue-property-decorator'
import WeekChooser, { WeekHours, defaultWeekHour } from '@/components/WeekChooser.vue'

import PeriodChooser from '@/components/PeriodChooser.vue'
import ZonesList from '@/components/ZonesList.vue'
import GroupList from '@/components/GroupList.vue'
import DeviceList from '@/components/DeviceList.vue'
import { getJSON } from '@/API/API'
import ws from '../ws'

export interface Zone{
  name:string
  dates:{start:Date, end:Date}
  weekHours:WeekHours
}

export interface Zones {[id:string]: Zone}

export interface FileType{
zones: Zones
}

const connection :any = {}

function createZone (name:string):Zone {
  return {
    name,
    dates: {
      start: new Date(),
      end: new Date()
    },
    weekHours: defaultWeekHour()
  }
}

const allowedWSData = ['deviceList'] as string[]
@Component({
  components: {
    WeekChooser,
    PeriodChooser,
    ZonesList,
    GroupList,
    DeviceList
  }
})
export default class HomeComp extends Vue {
   a = 5;

   zones :Zones= { default: createZone('default') };
   selectedZone = 'default';
   showGroups = false
  deviceList = [] as string[]

  zoneFileNames :string[]=[]
  mounted ():void {
    ws.init(this.newMessage, undefined)
    getJSON('zoneNames').then(data => {
      if (data !== undefined) {
        Vue.set(this, 'zoneFileNames', data)
      }
    })
    // allowedWSData = Object.keys(this).filter(e => !(e.startsWith('_') || e.startsWith('$')))
    // console.log('allowed data', allowedWSData)
  }

  newMessage (v:any):void {
    console.log(v)

    if (allowedWSData.includes(v.type)) { Vue.set(this, v.type, v.data) } else {
      console.error('unkown msg', v, allowedWSData)
    }
  }

  addZone ():void {
    const res = prompt('new exception zone')
    if (typeof (res) === 'string') { Vue.set(this.zones, res, createZone(res)) }
  }

  removeZone ():void {
    Vue.delete(this.zones, this.selectedZone)
  }

  loadNewJSON (f:FileType) : void{
    console.log('load new json file', f)
    this.zones = f.zones
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.header{
  display:flex
}
</style>
