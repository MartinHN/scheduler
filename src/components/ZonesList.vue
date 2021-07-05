<template>
  <div class="group chooser" style='display:grid;grid-template-columns="1Fr 1Fr"'>
      <select style=width:100% v-model=currentZoneName @change="loadFromFile($event.target.value)">
          <option style=width:100% v-for="v of zoneNames" :key=v.id :value=v>{{v}}</option>
      </select>

            <div style="display:grid;grid-template-columns:repeat(2,1fr);grid-gap:5px">
      <button class=flash @click="saveZoneToFile">save To File</button>
      <button class=flash @click="eraseZoneFile">erase File</button>
      <!-- <button @click="loadFromFile">load from File</button> -->
      <!-- <button @click="saveToDevice">save To Device</button>
      <button @click="loadFromDevice">load from Device</button> -->
      </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { FileType, Zones } from '@/views/Home.vue'
import { getJSON, postJSON, deleteJSON } from '@/API/API'

function replaceJSON (k : string, v : any) : any {
  if (v.type === 'default') {
    return undefined
  }
  return v
}

function getPruned (v:FileType):any {
  const zones = JSON.parse(JSON.stringify(v.zones, replaceJSON)) // as Zones
  zones.default.dates = undefined

  return { zones }
}
@Component({})
export default class ZonesList extends Vue {
    @Prop({ required: true })
    currentZoneData !: FileType;

    currentZoneName = ''
    zoneNames = new Array<string>()
    localFiles : {[key: string] : FileType} = {};

    // get prunedFileData ():any {
    //   return getPruned(this.currentZoneData)
    // //   return JSON.parse(JSON.stringify(this.currentZoneData, replaceJSON))
    // }

    mounted (): void{ this.updateAvailableZones() }

    async updateAvailableZones (): Promise<void> {
      const data = await getJSON('zoneNames')
      if (data !== undefined) {
        Vue.set(this, 'zoneNames', data)
      }

      if (!this.currentZoneName) {
        this.currentZoneName = this.zoneNames[0]
        console.log('forcing currentZoneName', this.currentZoneName)
        this.loadZoneNamed(this.currentZoneName)
      }
    }

    async saveZoneToFile () : Promise<string[]> {
      const name = prompt('file name', this.currentZoneName)
      if (name) {
        await postJSON(`zones?n=${name}`, this.currentZoneData)
        await this.updateAvailableZones()
        this.currentZoneName = name
      }

      return []
    }

    async eraseZoneFile ():Promise<void> {
      const name = this.currentZoneName
      await deleteJSON(`zones?n=${name}`)

      this.updateAvailableZones()
      this.loadZoneNamed(this.zoneNames[0])
    }

    async loadZoneNamed (name:string) :Promise<void> {
      if (!name) { console.error('nofile to load'); return }
      console.log('load', name)
      const savedFile = await getJSON(`zones?n=${name}`)
      if (savedFile) {
        this.$emit('input', savedFile)
        this.currentZoneName = name
      }
    }

    async saveAllZonesToDevice ():Promise<void> {
      for (const [k, v] of Object.entries(this.localFiles)) {
        await postJSON('zones?n=' + k, v)
      }
      this.updateAvailableZones()
      //   console.log('save', JSON.parse(JSON.stringify(this.currentZoneData, replaceJSON)))
    }
}
</script>

    <!--Add "scoped" attribute to limit CSS to this component only-->
<style scoped></style>
