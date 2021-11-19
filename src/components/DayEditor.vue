
<template>
  <div>

      <div class=row>
            <HourRangeComp v-for="v of value.hourRangeList" :key=v.id :value="v" @input="$emit('input',value)" />
      <div v-if="value.hourRangeList.length==0" style="background:red">OFF</div>
       <button @click=addRange > + </button>
       <button v-if="value.hourRangeList.length>0" @click=removeRange > - </button>

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
   value !:DayType

   // mounted ():void {

   // }

   addRange () {
     this.value.hourRangeList.push(ServerAPI.defaultHourRange())
     this.$emit('input', this.value)
   }

   removeRange () {
     this.value.hourRangeList.splice(-1, 1)
     this.$emit('input', this.value)
   }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
button{
  max-width:10px;
}
</style>
