<template>
  <div >
    <div style=display:flex>
      <Calendar  locale="fr" :attributes=attr @dayclick='dateClick("start",$event)' >
        <template v-slot="{ inputValue, inputEvents }">
            <input
              :value="inputValue.start"
              v-on="inputEvents.start"
              class="border px-2 py-1 w-32 rounded focus:outline-none focus:border-indigo-300"
            />
        </template>
      </Calendar>
      <svg
        class="w-4 h-4 mx-2"
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
      <Calendar  locale="fr"  :attributes=attr @dayclick='dateClick("end",$event)' >
        <template v-slot="{ inputValue, inputEvents }">
            <input
              :value="inputValue.end"
              v-on="inputEvents.end"
              class="border px-2 py-1 w-32 rounded focus:outline-none focus:border-indigo-300"
            />
        </template>
      </Calendar>
    </div>

  </div>
</template>

<script  lang="ts">
// @ is an alias to /src
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Calendar, DatePicker } from 'v-calendar'

@Component({
  components: {

    Calendar
    // DatePicker
  }
})
export default class PeriodComp extends Vue {
  private a=5
  private startDate = new Date()
  private endDate = new Date()
  get attr () {
    return [{ key: 'myP', highlight: 'red', dates: { start: this.startDate, end: this.endDate } }]
  }

  dateClick (id, e) {
    if (id === 'start') {
      if (e.date > this.endDate) {
        console.log('ignore')
        return
      }
      this.startDate = e.date
    } else if (id === 'end') {
      if (e.date < this.startDate) {
        console.log('ignore')
        return
      }
      this.endDate = e.date
    } else console.error('invalid id')

    // const tmp = this.startDate
    // this.startDate = this.endDate
    // this.endDate = tmp
  }
}
</script>
