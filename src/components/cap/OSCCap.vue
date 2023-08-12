<template>
  <div class="oscCap">
    <!--     OSC : {{conf}} -->
    <div class="row">
      <input
        v-model="conf.ip"
        :class="{ invalid: !hasValidIp }"
        @change="save"
      >
      <input
        class="port"
        type="number"
        :value="conf.port"
        :class="{ invalid: !hasValidPort }"
        @change="setPort"
      >
      loopTime
      <input
        class="port"
        type="number"
        :value="conf.loopTime"
        @change="setLoopTime"
      >
    </div>
    <div class="col">
      <div>
        onMessages
        <div class="row">
          <button @click="addMsg(true)">
            +
          </button><button
            v-if="conf.onMessages && conf.onMessages.length"
            @click="rmMsg(true)"
          >
            -
          </button>
        </div>
        <OSCMessageComp
          v-for="(m, i) of conf.onMessages"
          :key="m.address"
          :value="m"
          @input="msgChange(true, $event, i)"
        />
      </div>
      <div>
        offMessages
        <div class="row">
          <button @click="addMsg(false)">
            +
          </button><button
            v-if="conf.offMessages && conf.offMessages.length"
            @click="rmMsg(false)"
          >
            -
          </button>
        </div>
        <OSCMessageComp
          v-for="(m, i) of conf.offMessages"
          :key="m.address"
          :value="m"
          @input="msgChange(false, $event, i)"
        />
      </div>
    </div>
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
export default class OSCCapComp extends Vue {
  @Prop({ required: true })
  device!: Device;

  @Prop({ required: true })
  name!: string;

  conf = getDefaultOSCCap();

  @Watch('name')
  nameCh () {
    this.getConf()
  }

  mounted () {
    this.getConf()
  }

  async getConf () {
    this.conf = getDefaultOSCCap(await getCapForDevice(this.name, this.device))
  }

  get hasValidIp () {
    if (!this.conf.ip) return false
    return (
      ipNumRegex.test(this.conf.ip) ||
      this.conf.ip === 'localhost' ||
      this.conf.ip.endsWith('.local')
    )
  }

  get hasValidPort () {
    if (!this.conf.port) return false
    return this.conf.port > 200
  }

  get isValid () {
    return this.hasValidIp
  }

  setPort (ev) {
    this.conf.port = parseInt(ev.target.value)
    this.save()
  }

  setLoopTime (ev) {
    this.conf.loopTime = parseInt(ev.target.value)
    this.save()
  }

  msgChange (on: boolean, e, i) {
    console.log('msg is', e)
    const msgList = on ? this.conf.onMessages : this.conf.offMessages
    msgList[i] = e
    this.save()
  }

  addMsg (on: boolean) {
    const msgList = on ? this.conf.onMessages : this.conf.offMessages
    msgList.push(getDefaultOSCMsg())
    this.save()
  }

  rmMsg (on: boolean) {
    const msgList = on ? this.conf.onMessages : this.conf.offMessages
    msgList.pop()
    this.save()
  }

  save (): void {
    if (this.isValid) {
      setCapForDevice(
        this.name,
        this.device,
        JSON.parse(JSON.stringify(this.conf))
      )
    } else {
      console.log('not saving osc not valid')
    }
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
