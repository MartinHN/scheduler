<template>
  <div class="oscCap">
    <!-- OSC : {{value}} -->
    <div class="row">
      <input
        class="address"
        v-model="value.address"
        :class="{ invalid: !isValid }"
        @input="save"
      />

      <input
        class="args"
        :value="value.args.join(' ')"
        @input="setFromText($event.target.value)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { OSCTrigMessage } from '@/API/types/CapTypes'

@Component({})
export default class OSCMessageComp extends Vue {
  @Prop({ required: true })
  value!: OSCTrigMessage;

  get isValid () {
    return (
      this.value.address &&
      (this.value.address.startsWith('/') || this.value.address.includes(':'))
    )
  }

  setFromText (t) {
    console.log(t)
    this.value.args = t.split(' ')
    this.save()
  }

  save () {
    if (this.isValid) {
      this.$emit('input', this.value)
    } else {
      console.log('invalid msg not saving')
    }
  }
}
</script>

<style scoped>
.invalid {
  background: red;
}
/* .address{
  max-width: 100px
} */
.args {
  max-width: 200px;
}
</style>
