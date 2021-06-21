<template>
  <div class="home" style="display:grid;grid-template-columns:1fr 8fr">
    <div style=overflow-y>
      <div type=radio v-for="z of zones" :key=z.id @click="selectedZone=z" :style="{background:selectedZone==z?'blue':''}">{{z}}</div>
    </div>
    <div style="display:grid;grid-template-rows:1fr auto">
      <PeriodChooser v-if='selectedZone!="default"'/>
       <WeekChooser />
    </div>
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
  private zones = ['default', 'mo'];
private selectedZone = 'default';
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.active{
  background:red
}

</style>
