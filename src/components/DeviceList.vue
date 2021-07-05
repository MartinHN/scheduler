<template>
  <div class="device chooser" >
      <select style=width:100% v-model=currentDevice @change="selectDevice($event.target.value)">
          <option style=width:100% v-for="v,k of deviceList" :key=v.id :value=v>{{v}} {{ k}}</option>
      </select>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class DeviceList extends Vue {
@Prop()
deviceList!:string[]

currentDevice = ''

selectDevice (s:string) :void{
  this.$emit('input', s)
}
}
</script>

    <!--Add "scoped" attribute to limit CSS to this component only-->
<style scoped></style>
