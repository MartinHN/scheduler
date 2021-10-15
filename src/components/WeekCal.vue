
<template>

  <div class="weekCal" >

<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>

<script src="dist/jquery.schedule.min.js"></script>
<link rel="stylesheet" href="dist/jquery.schedule.min.css">

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Device } from '@/API/ServerAPI'
import { ServerModel } from '@/API/ServerModel'

@Component({})
export default class DeviceRow extends Vue {
  mounted () {

  }

  get sm ():ServerModel { return (this.$root as any).sm }
}
</script>

<style scoped>

</style>
