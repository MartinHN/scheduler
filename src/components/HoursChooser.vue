<template>
  <div class="hours">
    <div style='display:grid;grid-template:15px 1fr / 1fr 1fr;'>
    <div>
      start
</div>
    <div >
     to {{ nextDayText
      }}
      </div>
      <vue-timepicker
        v-model="value.start"
        @change="timeChanged"
        :minute-interval="15"
        hide-clear-button
      ></vue-timepicker>

          <!-- <svg
      style=width:50px
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
      </svg> -->

      <vue-timepicker

        v-model="value.end"
        @change="timeChanged"
        :minute-interval="15"
        hide-clear-button
      ></vue-timepicker>
  </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import VueTimepicker from 'vue2-timepicker/src/vue-timepicker.vue'

const isValidTimeString = (s: string):boolean => {
  return s.length > 0 && !s.includes('HH') // && !s.includes('mm')
}

const getSeconds = (s: string) => {
  const l = s.split(':')
  return parseInt(l[0]) * 60 * 60 + parseInt(l[1]) * 60
}
export interface HourRange {
  start: string;
  end: string;
}

export function defaultHourRange ():HourRange {
  return { start: 'HH:00', end: 'HH:00' }
}

@Component({
  components: {
    VueTimepicker
  }
})
export default class HoursChooser extends Vue {
  @Prop({ required: true })
  public value!: HourRange;

  timeChanged (e:any): void {
    // if (this.isValid) { this.$emit('input', { start: this.value.start, end: this.value.end }) }
  }

  get isValid ():boolean {
    return isValidTimeString(this.value.start) && isValidTimeString(this.value.end)
  }

  get nextDay () :boolean {
    return (
      this.isValid &&
      getSeconds(this.value.start) > getSeconds(this.value.end) &&
      getSeconds(this.value.end) !== 0
    )
  }

  get nextDayText () :string {
    return this.nextDay ? ' j+1' : ''
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .hours{
      /* display: flex; */
    /* flex-wrap: wrap; */
    /* flex-direction: column; */
    /* align-content: center; */
    /* align-items: center; */
        align-self: center;
    }
    .time-picker{
      min-width: 50px;
      width:inherit;
    }
    </style>
