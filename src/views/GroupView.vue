<template>
  <div class="group chooser">
    <div class="main">
      <GroupList
        class="grouplist"
        :groups="groups"
        @input="setSelectedGroup($event)"
      />
      <div>
        <div class="row">
          <div>
            <h1>{{ currentGroupName ? currentGroupName : "All" }}</h1>
          </div>
          <select
            v-if="Object.keys(currentGroup).length"
            v-model="currentGroup.agendaFileName"
            :class="{ warn: !currentGroup.agendaFileName }"
            @input="saveGroups"
          >
            <option
              v-for="d of availableAgendas"
              :key="d"
              :value="d"
            >
              {{ d }}
            </option>
          </select>
          <button @click="setGroupValue(true)">
            On Group
          </button>
          <button @click="setGroupValue(false)">
            Off Group
          </button>
        </div>
        <br>
        <DeviceRow
          v-for="v of displayedDevices"
          :key="v.uuid"
          :device="v"
          @input="deviceChanged"
        />
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
  get sm (): ServerModel {
    return (this.$root as any).sm
  }

  get connectedDeviceList () {
    return this.sm.connectedDeviceList
  }

  get knownDeviceList () {
    return Object.values(this.sm.knownDevices)
  }

  get groups () {
    return this.sm.groups
  }

  currentGroupName = '';
  get displayedDevices () {
    if (!this.currentGroupName) {
      return this.sortedKnownDevices
    }
    return this.sortedKnownDevices.filter((d) => {
      return d.group === this.currentGroupName
    })
  }

  get availableAgendas () {
    return this.sm.agendaFileNames
  }

  mounted (): void {
    //     if (!this.currentGroupName && Object.keys(this.groups).length > 0) {
    //   const firstName = Object.keys(this.groups)[0]
    //   console.log('forcing currentGroup to', firstName)
    //   this.loadGroupNamed(firstName)
    // }
  }

  deviceChanged () {
    this.save()
  }

  save (): void {
    setTimeout(() => {
      ServerAPI.saveKnownDeviceDic(this.sm.knownDevices)
    }, 0)
  }

  get currentGroup (): Group {
    return this.groups[this.currentGroupName] || {}
  }

  findInDevList (arr: Device[], el: Device): boolean {
    return (
      arr.find((e) => {
        return e.uuid === el.uuid
      }) !== undefined
    )
  }

  setSelectedGroup (g: Group | null) {
    this.currentGroupName = g?.name || ''
  }

  get sortedKnownDevices () {
    const getS = (a: Device): string => {
      return (a.group ? a.group : 'aaaa') + a.niceName
    }
    return Object.values(this.knownDeviceList).sort((a, b) => {
      return getS(a).localeCompare(getS(b))
    })
  }

  setGroupValue (b: boolean): void {
    console.log('settting group', b)
    this.displayedDevices.forEach((e) => {
      this.sm.activateDevice(e, b)
    })
  }

  saveGroups (e) {
    // deffer for vue to be up to date
    setTimeout(() => {
      ServerAPI.saveGroups(this.groups)
    }, 0)
  }
}
</script>

    <!--Add "scoped" attribute to limit CSS to this component only-->
<style scoped>
div.grouplist {
  /* overflow-y: auto; */
  max-height: 700px;
  position: sticky;
  align-self: flex-start;
  top: calc(var(--nav-header-h) - var(--btn-h));
}

.main {
  display: grid;
  grid-template-columns: 1fr 3fr;
  grid-gap: 15px;
}
</style>
