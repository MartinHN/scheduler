<template>
  <div class="main">
    <button
      class="flash"
      @click="resetAgendas"
    >
      effacer tout Agendas
    </button>
    <button @click="resetAll">
      Reset All Devices And Group
    </button>
    <button
      :class="{ active: sm.isAdminMode }"
      @click="setAdminMode(!sm.isAdminMode)"
    >
      AdminMode
    </button>
    <button @click="downloadState">
      Save settings
    </button><a
      id="downloadState"
      style="display: none"
    /><input
      type="file"
      name="load"
      @change="uploadState"
    >
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import * as HTTPAPI from '@/API/HTTPAPI'
import * as ServerAPI from '@/API/ServerAPI'

import { Group, Groups, Device } from '@/API/ServerAPI'

import GroupList from '@/components/GroupList.vue'
import DeviceRow from '@/components/DeviceRow.vue'
import { ServerModel } from '@/API/ServerModel'

@Component({
  components: {}
})
export default class ConfigView extends Vue {
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

  mounted (): void {
    //     if (!this.currentGroupName && Object.keys(this.groups).length > 0) {
    //   const firstName = Object.keys(this.groups)[0]
    //   console.log('forcing currentGroup to', firstName)
    //   this.loadGroupNamed(firstName)
    // }
  }

  save (): void {
    ServerAPI.saveKnownDeviceDic(this.sm.knownDevices)
  }

  get stateURL () {
    const u = HTTPAPI.getSrvResURL('state')
    console.log('state url is', u)
    return u
  }

  async resetAgendas (): Promise<void> {
    if (confirm('effacer tous les agendas?')) {
      await ServerAPI.resetDevicesAndGroups()
      document.location.reload()
    }
  }

  async resetAll (): Promise<void> {
    if (confirm('effacer tous les devices et groupes?')) {
      await ServerAPI.resetDevicesAndGroups()
      document.location.reload()
    }
  }

  async downloadState () {
    const state = await ServerAPI.getState()
    console.log('got state', state)
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(state))
    const dob = document.getElementById('downloadState')
    if (dob) {
      dob.setAttribute('href', dataStr)
      dob.setAttribute('download', 'state.json')
      dob.click()
    }
  }

  async uploadState (e) {
    const file = e.target.files[0]
    console.log('uploading state', file)
    const fileReader = new FileReader()
    fileReader.addEventListener('load', (event: any) => {
      console.log('sending state')
      ServerAPI.saveState(JSON.parse(event.target.result))
    })
    fileReader.readAsText(file)
    // await ServerAPI.setState(a)
  }

  setAdminMode(b) {
    this.sm.isAdminMode = !!b
    if (localStorage) { localStorage.setItem('admin', b ? '1' : '0') }
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

  grid-gap: 5px;
}
</style>
