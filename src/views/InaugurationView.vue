<template>
  <div class="inauguration">
    <!-- <button @click='this.$router.push("Home")'> back </button> -->
    <div>
      <div class="row">
        <img
          src="img/greenButton.png"
          :class="{ inactive: !isActive || !btnAreActive }"
          @click="setLight(true)"
        >
        <img
          src="img/redButton.png"
          :class="{ inactive: isActive || !btnAreActive }"
          @click="setLight(false)"
        >
      </div>
      <button
        id="agendaBtn"
        :class="{ active: sm.isAgendaDisabled }"
        :value="sm.isAgendaDisabled"
        :style="{ width: '100%', background: sm.isAgendaDisabled ? 'red' : '' }"
        @click="sm.setAgendaDisabled(!sm.isAgendaDisabled)"
      >
        Agenda {{ sm.isAgendaDisabled?"inactif":("actif - "+sm.nextSiteChange) }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import { ServerModel } from '@/API/ServerModel'
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  components: {}
})
export default class InaugurationComp extends Vue {
  get sm (): ServerModel {
    return (this.$root as any).sm
  }

  get btnAreActive() {
    return this.sm.inaugurationHasControl && this.sm.isAgendaDisabled
  }

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
img {
  max-width: 45vw;
}
.inactive {
  filter: brightness(0.5);
}

#agendaBtn {
  position:absolute;
  left: 0px;
  bottom:0px;
}
#agendaBtn:not(.active){
  background:green;
}
</style>
