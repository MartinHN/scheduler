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
          <button style=width:100% v-for="v of allAvailableDevices" :key=v class=flash :class={active:selectedDevices.includes(v),notconnected:!connectedDevices.includes(v)} @click=toggleStateFor(v) >{{(connectedDevices.includes(v)?'':'(disconnected) ') +v}}</button>
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

import { getJSON, postJSON, deleteJSON } from '@/API/API'

export interface Group{
  name:string
  filename?:string
  devices:string[]
}
export interface Groups{
  [key:string] : Group
}

@Component({})
export default class GroupList extends Vue {
    @Prop({ required: true })
    connectedDevices!:string[]

    storedDevices:string[] = []
    agendaFileNames:string[] = []

    currentGroupName = ''

    groups:Groups={}

    persistentDevices : string[] = []
    get currentGroup ():Group {
      return this.groups[this.currentGroupName] || {}
    }

    get allAvailableDevices ():string[] {
      console.log('update all available')
      const newDs = Array.from(new Set(this.connectedDevices.concat(this.storedDevices || [])))
      this.persistentDevices = Array.from(new Set(newDs.concat(this.persistentDevices)))
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
      this.groups = await getJSON('groups')
      if (!this.currentGroupName) {
        console.log('forcing currentGroup name')
        this.loadGroupNamed(Object.keys(this.groups)[0])
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
      const data = await getJSON('agendaNames')
      if (data !== undefined) {
        await Vue.set(this, 'agendaFileNames', data)
      }
    }

    loadGroupNamed (n:string) : void {
      console.log('assingnging stored', this.groups[n].devices)
      this.storedDevices = JSON.parse(JSON.stringify(this.groups[n].devices))
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
      await postJSON('groups', this.groups)
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
