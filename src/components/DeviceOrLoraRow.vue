<template>
  <div>
    <DeviceRow
      v-if="!isLora"
      :selected="selected"
      :device="device"
      @change="emitWifiChange"
      @input="emitWifiChange"
    />
    <LoraDeviceRow
      v-if="isLora"
      :device="device"
      editable=""
      @change="emitLoraChange"
    />
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Device } from '@/API/ServerAPI'
import { ServerModel, isLoraDevice } from '@/API/ServerModel'

import DeviceRow from '@/components/DeviceRow.vue'
import LoraDeviceRow from '@/components/LoraDeviceRow.vue'
import { LoraDevice } from '@/API/types/LoraDevice'

@Component({ components: { DeviceRow, LoraDeviceRow } })
export default class DeviceOrLoraRow extends Vue {
  @Prop({ default: false }) selected!: boolean

  @Prop({ required: false }) device!: Device | LoraDevice

  get isLora() {
    return isLoraDevice(this.device)
  }

  get sm(): ServerModel {
    return (this.$root as any).sm
  }

  getDevice(): Device | LoraDevice {
    return this.device
  }

  emitWifiChange(): void {
    this.$emit('change')
  }

  emitLoraChange(): void {
    this.$emit('loraChange')
  }
}
</script>

<style scoped>
</style>
