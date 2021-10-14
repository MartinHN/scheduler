<template>
  <div>

<button v-for="v of groupList" :key=v.id @click=setSelected(g) >{{g}}</button>
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Device, DeviceDic, Groups, Group } from '@/API/ServerAPI'

@Component({})
export default class GroupListComp extends Vue {
  @Prop({ required: true })
  groups!:Groups

  selected:Group| undefined = undefined
  mounted () :void{
    this.setSelected(undefined)
  }

  setSelected (g:Group|undefined) :void{
    this.selected = g
    this.$emit('input', g)
  }

  get groupList () :Group[] {
    return Array.from(Object.values(this.groups))
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
