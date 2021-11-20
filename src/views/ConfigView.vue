<template>
  <div class="config" >
      <button class=flash @click=resetAgendas >effacer tout Agendas</button>
          <button @click=resetAll> Reset All Devices And Group</button>
          <button @click='sm.isAdminMode=!sm.isAdminMode' :class={active:sm.isAdminMode} >AdminMode</button>
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

  }
})
export default class ConfigView extends Vue {
  get sm ():ServerModel { return (this.$root as any).sm }
  get connectedDeviceList () { return this.sm.connectedDeviceList }
  get knownDeviceList () { return Object.values(this.sm.knownDevices) }
  get groups () { return this.sm.groups }

  mounted (): void{

    //     if (!this.currentGroupName && Object.keys(this.groups).length > 0) {
    //   const firstName = Object.keys(this.groups)[0]
    //   console.log('forcing currentGroup to', firstName)
    //   this.loadGroupNamed(firstName)
    // }
  }

  save () :void{
    ServerAPI.saveKnownDeviceDic(this.sm.knownDevices)
  }

  async resetAgendas ():Promise<void> {
    if (confirm('effacer tous les agendas?')) {
      await ServerAPI.resetDevicesAndGroups()
      document.location.reload()
    }
  }

  async resetAll ():Promise<void> {
    if (confirm('effacer tous les devices et groupes?')) {
      await ServerAPI.resetDevicesAndGroups()
      document.location.reload()
    }
  }
}
</script>

    <!--Add "scoped" attribute to limit CSS to this component only-->
<style scoped>
 div.grouplist{
     /* overflow-y: auto; */
    max-height: 700px;
    position: sticky;
    align-self: flex-start;
    top:calc(var(--nav-header-h) - var(--btn-h));
}

.main{
  display:grid;
  grid-template-columns:1fr 3fr;
  grid-gap: 15px;
}

</style>
