<template>
  <div class=inauguration>
    <!-- <button @click='this.$router.push("Home")'> back </button> -->

<div class=row >
<img src="img/greenButton.png" :class="{inactive:!isActive}" @click=setLight(true) />
<img src="img/redButton.png" :class="{inactive:isActive}" @click=setLight(false) />
</div>
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import { ServerModel } from '@/API/ServerModel'
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  components: {
  }
})
export default class InaugurationComp extends Vue {
  get sm ():ServerModel { return (this.$root as any).sm }

  get isActive () {
    return this.sm.isInaugurationMode
  }

  setLight (b) {
    this.sm.setInaugurationMode(b)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

img{
  max-width:45vw
}
 .inactive{
  filter: brightness(0.5);
}
</style>
