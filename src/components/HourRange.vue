<template>
  <div class="hours">
    <div style="display: grid; grid-template: 1.2em 1fr / 1fr 30px 1fr">
      <div>début</div>
      <div />
      <div>fin {{ nextDayText }}</div>
      <vue-timepicker
        v-model="value.start"

        input-width="100%"
        :minute-interval="15"
        hide-clear-button
        @change="timeChanged"
      />

      <svg
        style="width: 30px"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M14 5l7 7m0 0l-7 7m7-7H3"
        />
      </svg>

      <vue-timepicker
        v-model="value.end"
        input-width="100%"
        :minute-interval="15"
        hide-clear-button
        @change="timeChanged"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import VueTimepicker from 'vue2-timepicker/src/vue-timepicker.vue'
import { HourRange } from '@/API/ServerAPI'
const isValidTimeString = (s: string): boolean => {
  return s.length > 0 && !s.includes('HH') // && !s.includes('mm')
}

const getSeconds = (s: string) => {
  const l = s.split(':')
  return parseInt(l[0]) * 60 * 60 + parseInt(l[1]) * 60
}

@Component({
  components: {
    VueTimepicker
  }
})
export default class HourRangeComp extends Vue {
  @Prop({ required: true })
  public value!: HourRange

  timeChanged (e: any): void {
    // console.log('>>>>>', this.isValid)
    if (this.isValid) {
      this.$emit('input', { start: this.value.start, end: this.value.end })
    }
  }

  get isValid (): boolean {
    return (
      isValidTimeString(this.value.start) && isValidTimeString(this.value.end)
    )
  }

  get nextDay (): boolean {
    return (
      this.isValid &&
      getSeconds(this.value.start) > getSeconds(this.value.end) &&
      getSeconds(this.value.end) !== 0
    )
  }

  get nextDayText (): string {
    return this.nextDay ? ' j+1' : ''
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.hours {
  /* display: flex; */
  /* flex-wrap: wrap; */
  /* flex-direction: column; */
  /* align-content: center; */
  /* align-items: center; */
  align-self: center;
}

</style>
