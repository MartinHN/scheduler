
<template>
  <div class="hours chooser" style=display:flex>

    <div> start <vue-timepicker v-model="startS" @change=timeChanged :minute-interval="5"></vue-timepicker></div>
    <div> end {{nextDayText}}<vue-timepicker v-model="endS" @change=timeChanged :minute-interval="5"></vue-timepicker></div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import VueTimepicker from 'vue2-timepicker/src/vue-timepicker.vue'

const isValidTimeString = (s:string) => {
  return s && !s.includes('HH')// && !s.includes('mm')
}

const getSeconds = (s:string) => {
  const l = s.split(':')
  return parseInt(l[0]) * 60 * 60 + parseInt(l[1]) * 60
}

@Component({
  components: {
    VueTimepicker
  }
})
export default class HoursChooser extends Vue {
  private startS= 'HH:00';
  private endS= 'HH:00';
  public value = { start: '', end: '' }
  timeChanged (e): any {
    if (this.isValid) { this.$emit('input', { start: this.startS, end: this.endS }) }
  }

  get isValid () {
    return isValidTimeString(this.startS) && isValidTimeString(this.endS)
  }

  get nextDay () {
    return this.isValid && (getSeconds(this.startS) > getSeconds(this.endS))
  }

  get nextDayText () {
    return this.nextDay ? '(+1 j)' : ''
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
