<template>
  <div class="group chooser" style='display:grid;grid-template-columns="1Fr 1Fr"'>

<br>
<div>  group of devices to edit </div>
      <select style=width:100% v-model=currentGroupName >
          <option style=width:100% v-for="v of groupNames" :key=v.id :value=v>{{v}}</option>
      </select>

<br>
<div>  devices in group </div>
<div class=grouplist>
          <button style=width:100% v-for="v of allAvailableDevices" :key=v.id class=flash :class={active:selectedDevices.includes(v),notconnected:!connectedDevices.includes(v)} @click=toggleStateFor(v) >{{(connectedDevices.includes(v)?'':'(disconnected) ') +JSON.stringify(v)}}</button>
</div> <br>
<div>  time agenda to use </div>
        <select style=width:100% v-model=currentFileName >
          <option style=width:100% v-for="v of agendaFileNames" :key=v.id :value=v>{{v}}</option>
      </select>
      <br>
      <div>  saves and delete </div>
         <button @click="addGroup" class=flash >save or add group</button>
      <button class=flash @click="eraseGroup">erase group</button>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import * as ServerAPI from '@/API/ServerAPI'

import { Group, Groups, Device } from '@/API/ServerAPI'

@Component({})
export default class GroupList extends Vue {
    @Prop({ required: true })
    connectedDevices!:Device[]

    storedDevices:Device[] = []
    agendaFileNames:string[] = []

    currentGroupName = ''

    groups:Groups={}

    persistentDevices : Device[] = []
    get currentGroup ():Group {
      return this.groups[this.currentGroupName] || {}
    }

    findInDevList (arr:Device[], el:Device):boolean {
      return arr.find((e) => { return e.deviceName === el.deviceName && e.ip === el.ip }) !== undefined
    }

    get allAvailableDevices ():Device[] {
      console.log('update all available', this.connectedDevices, this.storedDevices)
      const newDs = this.connectedDevices.slice()
      console.log('new', newDs)
      this.storedDevices.forEach(e => { if (!this.findInDevList(this.connectedDevices, e)) { newDs.push(JSON.parse(JSON.stringify(e))) } })
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

    mounted (): void{ this.loadFileNames(); this.loadGroups() }

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

  // async refreshGroups () :Promise<void> {
  //   await this.saveGroups()
  //   this.loadGroups()
  // }
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
