<template>
  <div >
    <div style=display:flex>
      <DatePicker  locale="fr" :max-date=endDate :value=startDate :attributes=attr @dayclick='dateClick("start",$event) ' >
        <template  v-slot="{ inputValue,inputEvents }">
         <input
              style=font-size:1em
              :value="inputValue"
              v-on=inputEvents
            />
        </template>
      </DatePicker>
      <svg
      style=max-width:50px
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
      <DatePicker  locale="fr" :min-date=startDate  :value=endDate :attributes=attr @dayclick='dateClick("end",$event)' >
        <template  v-slot="{ inputValue,inputEvents }">
         <input
              style=font-size:1em
              :value="inputValue"
              v-on=inputEvents
            />
        </template>
      </DatePicker>
    </div>

  </div>
</template>

<script  lang="ts">
// @ is an alias to /src
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Calendar, DatePicker } from 'v-calendar'

@Component({
  components: {

    // Calendar
    DatePicker
  }
})
export default class PeriodComp extends Vue {
  private a=5
  private startDate = new Date()
  private endDate = new Date()
  get attr () {
    return [{ key: 'myP', highlight: 'blue', dates: { start: this.startDate, end: this.endDate } }]
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
