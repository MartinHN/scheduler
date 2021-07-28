<template>
  <div class=fullpage>
    <!-- <button @click='this.$router.push("Home")'> back </button> -->
<div>Inauguration</div>

  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  components: {

  }
})
export default class InaugurationComp extends Vue {
  navigateTo (n:string):void{
    debugger;
    (this as any).$router.push(n)
    // window.location.href = window.location.hostname+"/"+n+"View"
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/*
.fullpage{
  display:flex;
  min-height:100vh;
} */

</style>
