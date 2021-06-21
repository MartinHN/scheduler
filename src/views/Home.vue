<template>
  <div class="home">
    <div style=display:flex>
<PeriodChooser/>
    </div>

    <WeekChooser />
  </div>
</template>

<script  lang="ts">
// @ is an alias to /src
import { Component, Prop, Vue } from 'vue-property-decorator'
import WeekChooser from '@/components/WeekChooser.vue'
import PeriodChooser from '@/components/PeriodChooser.vue'

@Component({
  components: {
    WeekChooser,
    PeriodChooser

  }
})
export default class HomeComp extends Vue {
  private a=5
  private range = { start: '', end: '' };
  get calAttributes () {
    return this.attributes.map(e => { return { key: e.name, hightlight: true, content: 'red' } })
  }
}
</script>
