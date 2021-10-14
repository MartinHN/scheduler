<template>
  <div class="group chooser" style='display:grid;grid-template-columns="1Fr 1Fr"'>
 <GroupList  />

 <DeviceRow v-for="v of displayedDevices" :key=v.id  />
<br>
<!-- <div>  group of devices to edit </div>
      <select style=width:100% v-model=currentGroupName >
          <option style=width:100% v-for="v of groupNames" :key=v.id :value=v>{{v}}</option>
      </select>

<br>
<div>  devices in group </div>

<div class=grouplist>
          <button style=width:100% v-for="v of knownDeviceList" :key=v.id class=flash :class={active:selectedDevices.includes(v),notconnected:!findInDevList(connectedDevices,v)} @click=toggleStateFor(v) >{{(findInDevList(connectedDevices,v)?'':'(disconnected) ') +JSON.stringify(v)}}</button>
</div> <br>
<div>  time agenda to use </div>
        <select style=width:100% v-model=currentFileName >
          <option style=width:100% v-for="v of agendaFileNames" :key=v.id :value=v>{{v}}</option>
      </select>
      <br>
      <div>  saves and delete </div>
         <button @click="addGroup" class=flash >save or add group</button>
      <button class=flash @click="eraseGroup">erase group</button> -->

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import * as ServerAPI from '@/API/ServerAPI'

import { Group, Groups, Device } from '@/API/ServerAPI'

import GroupList from '@/components/GroupList.vue'
import DeviceRow from '@/components/DeviceRow.vue'
import { ServerModel } from '@/API/ServerModel'
@Component({
  components: {
    GroupList,
    DeviceRow
  }
})
export default class GroupView extends Vue {
  get sm ():ServerModel { return (this.$root as any).sm }
  get connectedDeviceList () { return this.sm.connectedDeviceList }
  get knownDevices () { return this.sm.knownDevices }

    storedDevices:Device[] = []
    agendaFileNames:string[] = []

    currentGroupName = ''

    groups:Groups={}

    persistentDevices : Device[] = []
    mounted (): void{ console.log('>>>>>>>>>>>', this.connectedDeviceList); this.loadFileNames(); this.loadGroups() }
    get currentGroup ():Group {
      return this.groups[this.currentGroupName] || {}
    }

    findInDevList (arr:Device[], el:Device):boolean {
      return arr.find((e) => { return e.uuid === el.uuid }) !== undefined
    }

    get allAvailableDevices ():Device[] {
      console.log('update all available', this.connectedDeviceList, this.storedDevices)
      const newDs = this.connectedDeviceList.slice()
      console.log('new', newDs)
      this.storedDevices.forEach(e => { if (!this.findInDevList(this.connectedDeviceList, e)) { newDs.push(JSON.parse(JSON.stringify(e))) } })
      Vue.set(this, 'persistentDevices', newDs)// Array.from(new Set(newDs.concat(this.persistentDevices)))
      return this.persistentDevices
    }

    get groupNames () :Array<string> {
      return Array.from(Object.keys(this.groups))
    }

    get selectedDevices ():string[] {
      return this.currentGroup?.devices || []
    }

    set selectedDevices (v:string[]) {
      if (this.currentGroup?.name) {
        console.log('sel dev', v)
        Vue.set(this.currentGroup, 'devices', v)
      } else console.error('no group loaded')
    }

    get currentFileName ():string {
      return this.currentGroup?.filename || ''
    }

    set currentFileName (v:string) {
      if (this.currentGroup) {
        this.currentGroup.filename = v
      }
    }

    async loadGroups () :Promise<void> {
      this.groups = await ServerAPI.getGroups()
      if (!this.currentGroupName && Object.keys(this.groups).length > 0) {
        const firstName = Object.keys(this.groups)[0]
        console.log('forcing currentGroup to', firstName)
        this.loadGroupNamed(firstName)
      }
    }

    toggleStateFor (v:string):void {
      const old = this.selectedDevices.splice(0).map(e => '' + e)
      const idx = old.indexOf('' + v)
      // idx = -1
      console.log('toggling state', v, JSON.stringify(old), idx)
      if (idx >= 0) {
        // Vue.delete(this.selectedDevices, )
        old.splice(idx, 1)
      } else {
        old.push(v)
      }
      this.selectedDevices = old
    }

    async loadFileNames ():Promise<void> {
      const data = await ServerAPI.getAgendaNames()
      if (data !== undefined) {
        await Vue.set(this, 'agendaFileNames', data)
      }
    }

    loadGroupNamed (n:string) : void {
      console.log('assigning stored', this.groups[n].devices)
      this.storedDevices = JSON.parse(JSON.stringify(this.groups[n].devices)) as Device[]
      this.currentGroupName = n
    }

    async addGroup ():Promise<void> {
      const gn = prompt('group name', this.currentGroupName)
      if (gn) {
        await Vue.set(this.groups, gn, { name: gn, filename: this.currentGroup.filename, devices: this.selectedDevices })
        this.loadGroupNamed(gn)
      }
      this.saveGroups()
    }

    eraseGroup ():void {
      Vue.delete(this.groups, this.currentGroupName)
      this.saveGroups()
      this.loadGroupNamed(Object.keys(this.groups)[0])
    }

    async saveGroups ():Promise<void> {
      await ServerAPI.saveGroups(this.groups)
    }
}
</script>

    <!--Add "scoped" attribute to limit CSS to this component only-->
<style scoped>
div.grouplist{
     overflow-y: auto;
    max-height: 200px;
}

.grouplist button.notconnected.active{
  opacity: 0.5;
}
</style>
