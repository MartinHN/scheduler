<template>
  <div>
    <div class="row">
      <button @click="addGroup">Ajout Groupe</button>
      <button @click="removeGroup">Effacer Groupe</button>
    </div>
    <button @click="setSelected()" :class="{ active: !selected }">
      Afficher tous
    </button>
    <button
      v-for="v of groupList"
      :key="v.id"
      @click="setSelected(v)"
      :class="{ active: selectedGroupName === v.name }"
      class="tab"
    >
      {{ v.name }} ( {{ devicesInGroup(v).length }} )
    </button>
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Device, DeviceDic, Groups, Group } from '@/API/ServerAPI'
import * as ServerAPI from '@/API/ServerAPI'
import { ServerModel } from '@/API/ServerModel'

@Component({})
export default class GroupListComp extends Vue {
  @Prop({ required: true })
  groups!: Groups;

  get sm (): ServerModel {
    return (this.$root as any).sm
  }

  selected: Group | null = null;
  mounted (): void {
    this.setSelected(null)
  }

  setSelected (g: Group | null): void {
    if (this.selected && g === this.selected) {
      this.selected = null
    } else {
      this.selected = g
    }
    this.$emit('input', this.selected)
  }

  get selectedGroupName () {
    return this.selected?.name
  }

  get groupList (): Group[] {
    return Array.from(Object.values(this.groups))
  }

  devicesInGroup (g: Group): Device[] {
    return this.sm.devicesInGroup(g)
  }

  async addGroup (): Promise<void> {
    const gn = prompt('group name', '')
    if (gn) {
      const group = ServerAPI.newEmptyGroup(gn)
      await Vue.set(this.groups, gn, group)
      this.selected = group
      this.save()
    }
  }

  async removeGroup (n: string): Promise<void> {
    const gn = prompt('group name', this.selectedGroupName)
    if (gn) {
      await Vue.delete(this.groups, gn)
      this.selected = null
    }
    this.save()
  }

  async save () {
    // re format
    Object.values(this.groups).forEach((g) => {
      this.groups[g.name] = ServerAPI.newEmptyGroup(g.name, g)
    })
    ServerAPI.saveGroups(this.groups)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
