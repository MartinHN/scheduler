
<template>
  <div>
    <div class="row">
      <div class="hours">
        <template
          v-for="v of value.hourRangeList"
        >
          <HourRangeComp
            :value="v"
            @input="$emit('input', value)"
          />
        </template>
      </div>
      <div
        v-if="value.hourRangeList.length == 0"
        style="background: red"
      >
        OFF
      </div>
      <button
        class="customFont"
        @click="addRange"
      >
        +
      </button>
      <button
        v-if="value.hourRangeList.length > 0"
        class="customFont"
        @click="removeRange"
      >
        -
      </button>
    </div>
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Prop, Vue } from 'vue-property-decorator'

import HourRangeComp from '@/components/HourRange.vue'
import { DayType } from '@/API/ServerAPI'
import * as ServerAPI from '@/API/ServerAPI'
@Component({
  components: {
    HourRangeComp
  }
})
export default class DayEditor extends Vue {
  @Prop({ required: true })
  value!: DayType;

  // mounted ():void {

  // }

  addRange(): void {
    this.value.hourRangeList.push(ServerAPI.defaultHourRange())
    this.$emit('input', this.value)
  }

  removeRange(): void {
    this.value.hourRangeList.splice(-1, 1)
    this.$emit('input', this.value)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
button {
  max-width: 66px;
  font-size: 3rem;
  font-weight: bold;
}

.hours {
  flex-wrap: wrap;
}
</style>
