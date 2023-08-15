<template>
  <div class="htmlCap">
    HTML
    <a
      :href="capURL"
      target="_blank"
    > configuration </a>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import OSCMessageComp from './OSCMessageComp.vue'
import { Device, getCapForDevice, setCapForDevice } from '@/API/ServerAPI'
import { ServerModel } from '@/API/ServerModel'
import {
  OSCCap,
  getDefaultOSCCap,
  getDefaultOSCMsg
} from '@/API/types/CapTypes'

const ipNumRegex =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

@Component({ components: { OSCMessageComp } })
export default class HTMLCap extends Vue {
  @Prop({ required: true })
    device!: Device

  @Prop({ required: true })
    name!: string

  @Prop({ required: true })
    port!: number

  get capURL () {
    return `http://${this.device.ip}:${this.port}`
  }
}
</script>

<style scoped>
.invalid {
  background: red;
}

.port {
  max-width: 100px;
}
</style>
