<template>
  <div>
    <div>
      <DayEditor
        v-model="value.defaultDay"
        style="background: gray"
        @input="$emit('input', value)"
      />
      <h1>Exceptions</h1>
      <select
        id="newDaysSelect"
        ref="newDaysSelect"
        @input="addException($event.target.value)"
      >
        <option
          selected
          value
          disabled
        >
          + ajouter un jour
        </option>
        <option
          v-for="d of availableDays"
          :key="d"
        >
          {{ d }}
        </option>
      </select>
      <div
        v-for="v of exceptionList"
        :key="v.dayName"
      >
        <div class="exceptionTable">
          <div>{{ v.dayName }}</div>
          <DayEditor
            :value="v"
            @input="$emit('input', value)"
          />
          <button
            style="background: red"
            @click="removeException(v.dayName)"
          >
            <img src="img/trash.svg">
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Prop, Vue } from 'vue-property-decorator'

import { WeekHours, ExceptionList } from '@/API/ServerAPI'
import DayEditor from './DayEditor.vue'
import * as ServerAPI from '@/API/ServerAPI'

@Component({
  components: {
    DayEditor
  }
})
export default class WeekEditor extends Vue {
  @Prop({ required: true })
    value!: WeekHours

  // mounted ():void {

  // }

  get availableDays (): string[] {
    return ServerAPI.getAvailableExceptionDaysFromWH(this.value)
  }

  get exceptionList (): ExceptionList {
    return ServerAPI.getExceptionListFromWH(this.value).sort(
      (a, b) =>
        ServerAPI.dayNames.indexOf(a.dayName) -
        ServerAPI.dayNames.indexOf(b.dayName)
    )
  }

  async addException (d: string): Promise<void> {
    if (ServerAPI.dayNames.includes(d)) {
      const dd = ServerAPI.createDefaultDayType()
      dd.dayName = d
      dd.hourRangeList = []
      await this.value.exceptions.push(dd)
    } else {
      console.error('invalid day name', d)
    }
    const dob = this.$refs.newDaysSelect as HTMLSelectElement
    dob.selectedIndex = 0
    // for (const o of dob.options) {
    //   o.selected = false
    // }

    this.$emit('input', this.value)
  }

  async removeException (d: string): Promise<void> {
    if (ServerAPI.dayNames.includes(d)) {
      const idx = this.value.exceptions.findIndex((e) => e.dayName === d)
      if (idx >= 0) {
        this.value.exceptions.splice(idx, 1)
      }
    } else {
      console.error('invalid day name', d)
    }
    this.$emit('input', this.value)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.exceptionTable {
  background: black;
  border: 1px solid black;
  display: grid;
  grid-template-columns: 5em 7fr 1fr;
  grid-gap: 1px 1px;
}
.exceptionTable > * {
  background: grey;
  padding: 0px;
}
</style>
