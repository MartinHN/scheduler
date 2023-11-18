<template>
  <div class="group chooser">
    <div class="main">
      <GroupList
        class="grouplist"
        :groups="groups"
        @input="setSelectedGroup($event)"
      />
      <div class="displayedGroup">
        <div class="row">
          <!-- <div>
            <h1>{{ currentGroupName ? currentGroupName : "All" }}</h1>
          </div> -->
          <img
            v-if="Object.keys(currentGroup).length"
            src="img/calendar.svg"
            style="    max-width: 3em;"
          >
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
        <div class="displayedDevices">
          <DeviceOrLoraRow
            v-for="v of displayedDevices"
            :key="devUuid(v)"
            :device="v"
            @change="save"
            @loraChange="saveLora"
          />
        </div>
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
import { ServerModel, getUuidForAnyDevice, isLoraDevice } from '@/API/ServerModel'
import LoraDeviceRow from '@/components/LoraDeviceRow.vue'
import DeviceOrLoraRow from '@/components/DeviceOrLoraRow.vue'
import { LoraDevice } from '@/API/types/LoraDevice'
@Component({
  components: {
    GroupList,
    DeviceRow,
    LoraDeviceRow,
    DeviceOrLoraRow
  }
})
export default class GroupView extends Vue {
  get sm (): ServerModel {
    return (this.$root as any).sm
  }

  get connectedDeviceList () {
    return this.sm.connectedDeviceList
  }

  get knownDeviceList(): Array<LoraDevice | Device> {
    return this.sm.getAllDevicesList()
  }

  get groups () {
    return this.sm.groups
  }

  currentGroupName = ''
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

  saveLora() {
    setTimeout(() => {
      ServerAPI.setKnownLoraDevices(this.sm.knownLoraDevices)
    }, 0)
  }

  save (): void {
    setTimeout(() => {
      ServerAPI.saveKnownDeviceDic(this.sm.knownDevices)
    }, 0)
  }

  get currentGroup (): Group {
    return this.groups[this.currentGroupName] || {}
  }

  devUuid(d) {
    return getUuidForAnyDevice(d)
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

  // get loraOrWifiDevs() {
  //   return [...Object.values(this.knownDeviceList)]
  // }

  get sortedKnownDevices () {
    const getS = (a: Device | LoraDevice): string => {
      return (a.group ? a.group : 'aaaa') + ((a as Device).niceName || (a as LoraDevice).deviceName)
    }
    return Object.values(this.knownDeviceList).sort((a, b) => {
      return getS(a).localeCompare(getS(b))
    })
  }

  setGroupValue (b: boolean): void {
    console.log('settting group', b)
    this.displayedDevices.forEach((e) => {
      if (isLoraDevice(e)) { this.sm.activateLoraDevice(e as LoraDevice, b) } else { this.sm.activateDevice(e as Device, b) }
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
  display:grid;
  max-width:260px;
  flex:auto;
  position: sticky;
  align-self: flex-start;
  top: calc(var(--nav-header-h) - var(--btn-h));
}

.main {
  display: flex;
  grid-template-columns: 1fr 3fr;
  grid-gap: 15px;
}

.displayedGroup{
  flex:auto
}
.displayedDevices{
  display:flex;
  flex-direction:column;
  gap:5px;
}
</style>
