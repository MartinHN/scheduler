<template>
  <div class="group chooser" >
    <div class=main>
      <GroupList class=grouplist :groups=groups @input=setSelectedGroup($event) />
      <div>
        <div  class=groupCtl>
        <div><h1>{{currentGroupName? currentGroupName : "All"}}</h1></div>
        <button @click=setGroupValue(true)> On Group </button>
        <button @click=setGroupValue(false)> Off Group </button>
        </div>
        <DeviceRow v-for="v of displayedDevices" :key=v.id :device=v  @input=deviceChanged  />
      </div>
    </div>
<!--
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
  get knownDeviceList () { return Object.values(this.sm.knownDevices) }
  get groups () { return this.sm.groups }

  currentGroupName=''
  get displayedDevices () {
    if (!this.currentGroupName) {
      return this.sortedKnownDevices
    }
    return this.sortedKnownDevices.filter(d => { return d.group === this.currentGroupName })
  }

  mounted (): void{

    //     if (!this.currentGroupName && Object.keys(this.groups).length > 0) {
    //   const firstName = Object.keys(this.groups)[0]
    //   console.log('forcing currentGroup to', firstName)
    //   this.loadGroupNamed(firstName)
    // }
  }

  deviceChanged () {
    this.save()
  }

  save () :void{
    ServerAPI.saveKnownDevices(this.sm.knownDevices)
  }

  get currentGroup ():Group {
    return this.groups[this.currentGroupName] || {}
  }

  findInDevList (arr:Device[], el:Device):boolean {
    return arr.find((e) => { return e.uuid === el.uuid }) !== undefined
  }

  setSelectedGroup (g:Group|null) {
    this.currentGroupName = g?.name || ''
  }

  get sortedKnownDevices () {
    const getS = (a:Device):string => { return (a.group ? a.group : 'aaaa') + a.niceName }
    return Object.values(this.knownDeviceList).sort((a, b) => { return getS(a).localeCompare(getS(b)) })
  }

  setGroupValue (b:boolean):void{
    console.log('settting group', b)
    this.displayedDevices.forEach(e => { this.sm.activateDevice(e, b) })
  }
  // get allAvailableDevices ():Device[] {
  //   console.log('update all available', this.connectedDeviceList, this.storedDevices)
  //   const newDs = this.connectedDeviceList.slice()
  //   console.log('new', newDs)
  //   this.storedDevices.forEach(e => { if (!this.findInDevList(this.connectedDeviceList, e)) { newDs.push(JSON.parse(JSON.stringify(e))) } })
  //   Vue.set(this, 'persistentDevices', newDs)// Array.from(new Set(newDs.concat(this.persistentDevices)))
  //   return this.persistentDevices
  // }

  // get groupNames () :Array<string> {
  //   return Array.from(Object.keys(this.groups))
  // }

  // get selectedDevices ():string[] {
  //   return this.currentGroup?.devices || []
  // }

  // set selectedDevices (v:string[]) {
  //   if (this.currentGroup?.name) {
  //     console.log('sel dev', v)
  //     Vue.set(this.currentGroup, 'devices', v)
  //   } else console.error('no group loaded')
  // }

  // get currentFileName ():string {
  //   return this.currentGroup?.filename || ''
  // }

  // set currentFileName (v:string) {
  //   if (this.currentGroup) {
  //     this.currentGroup.filename = v
  //   }
  // }

  // toggleStateFor (v:string):void {
  //   const old = this.selectedDevices.splice(0).map(e => '' + e)
  //   const idx = old.indexOf('' + v)
  //   // idx = -1
  //   console.log('toggling state', v, JSON.stringify(old), idx)
  //   if (idx >= 0) {
  //     // Vue.delete(this.selectedDevices, )
  //     old.splice(idx, 1)
  //   } else {
  //     old.push(v)
  //   }
  //   this.selectedDevices = old
  // }

  // loadGroupNamed (n:string) : void {
  //   console.log('assigning stored', this.groups[n].devices)
  //   this.storedDevices = JSON.parse(JSON.stringify(this.groups[n].devices)) as Device[]
  //   this.currentGroupName = n
  // }

  // async addGroup ():Promise<void> {
  //   const gn = prompt('group name', this.currentGroupName)
  //   if (gn) {
  //     await Vue.set(this.groups, gn, { name: gn, filename: this.currentGroup.filename, devices: this.selectedDevices })
  //     this.loadGroupNamed(gn)
  //   }
  //   this.saveGroups()
  // }

  // eraseGroup ():void {
  //   Vue.delete(this.groups, this.currentGroupName)
  //   this.saveGroups()
  //   this.loadGroupNamed(Object.keys(this.groups)[0])
  // }

  // async saveGroups ():Promise<void> {
  //   await ServerAPI.saveGroups(this.groups)
  // }
}
</script>

    <!--Add "scoped" attribute to limit CSS to this component only-->
<style scoped>
 div.grouplist{
     overflow-y: auto;
    max-height: 700px;
}

.main{
  display:grid;
  grid-template-columns:1fr 3fr;
}

.groupCtl{
display:flex;
}
</style>
