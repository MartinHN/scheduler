<template>
  <div >
    <div style=display:flex;justify-content:space-evenly;>
      <DatePicker  locale="fr" :max-date=value.end :value=value.start :attributes=attr @dayclick='dateClick("start",$event) ' >
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
      <DatePicker  locale="fr" :min-date=value.start  :value=value.end :attributes=attr @dayclick='dateClick("end",$event)' >
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

import { DatePicker } from 'v-calendar'

interface DateRange {
    start: Date,
    end: Date
}

@Component({
  components: {
    DatePicker
  }
})
export default class PeriodComp extends Vue {
  @Prop({ required: true })
  private value !:DateRange

  get attr ():any {
    return [{ key: 'myP', highlight: 'blue', dates: { start: this.value.start, end: this.value.end } }]
  }

  private dateClick (id:any, e:any) {
    // const newD = this.value // JSON.parse(JSON.stringify(this.value))// { start: this.value.start, end: this.value.end }
    if (id === 'start') {
      if (e.date > this.value.end) {
        console.log('ignore')
        return
      }
      this.value.start = e.date
    } else if (id === 'end') {
      if (e.date < this.value.start) {
        console.log('ignore')
        return
      }
      this.value.end = e.date
    } else console.error('invalid id')

    // this.$emit('input', newD)

  // const tmp = this.value.start
  // this.value.start = this.value.end
  // this.value.end = tmp
  }
}
</script>
