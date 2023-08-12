<template>
  <div class="fullpage">
    <button
      class="customFont"
      @click="navigateTo('InaugurationView')"
    >
      J'inaugure
    </button>
    <button
      class="customFont"
      @click="navigateTo('AgendasView')"
    >
      J'installe
    </button>
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  components: {}
})
export default class HomeComp extends Vue {
  navigateTo (n: string): void {
    (this as any).$router.push(n)
    // window.location.href = window.location.hostname+"/"+n+"View"
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.fullpage {
  height: 100vh;
  display: grid;
  grid-template-rows: 1fr 1fr;
}

.fullpage button {
  font-size: 4em;
}
</style>
