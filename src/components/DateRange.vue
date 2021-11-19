<template>
  <div >
    <div class=row style=justify-content:space-evenly;>
      <DatePicker  locale="fr" :value=startDate :attributes="getAttr('startInput')" @dayclick='dateClick("start",$event) ' >
        <template  v-slot="{ inputValue,inputEvents }">
         <input
              id="startInput"
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
      <DatePicker   locale="fr" :min-date=startDate  :value=endDate :attributes="getAttr('endInput')" @dayclick='dateClick("end",$event)' >
        <template  v-slot="{ inputValue,inputEvents }">
         <input
              id="endInput"
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

import { DatePicker } from 'v-calendar'
import * as ServerAPI from '@/API/ServerAPI'

interface DateRange {
    start: string,
    end: string
}

@Component({
  components: {
    DatePicker
  }
})
export default class DateRangeComp extends Vue {
  @Prop({ required: true })
  private value !:DateRange

  mounted () {
    console.log(this.value, '>>>>', ServerAPI.dateDayFromString(this.value.start))
  }

  getAttr (hint:string):any {
    return [{ key: hint, highlight: 'blue', dates: { start: this.startDate, end: this.endDate } }]
  }

  get startDate () {
    return ServerAPI.dateDayFromString(this.value.start)
  }

  get endDate () {
    return ServerAPI.dateDayFromString(this.value.end)
  }

  private dateClick (id:any, e:any) {
    // const newD = this.value // JSON.parse(JSON.stringify(this.value))// { start: this.value.start, end: this.value.end }
    if (id === 'start') {
      if (e.date > this.endDate) {
        // console.log('ignore')
        // return
        this.value.end = ServerAPI.dateDayToString(e.date as Date)
      }
      console.log('>>>>>>>' + e.date)
      this.value.start = ServerAPI.dateDayToString(e.date as Date)
    } else if (id === 'end') {
      if (e.date < this.startDate) {
        console.log('ignore')
        return
      }
      this.value.end = ServerAPI.dateDayToString(e.date as Date)
    } else console.error('invalid id')

    this.$emit('input', this.value)

  // const tmp = this.value.start
  // this.value.start = this.value.end
  // this.value.end = tmp
  }
}
</script>
