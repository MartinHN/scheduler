<template>
  <div>
    <div class="row">
      <button
        class="tab"
        :class="{ active: showDefaultWeek }"
        @click="showDefaultWeek = true"
      >
        Semaine par defaut
      </button>

      <button
        class="tab"
        :class="{ active: !showDefaultWeek }"
        @click="showDefaultWeek = false"
      >
        Exceptions
      </button>
    </div>
    <br>
    <div v-if="showDefaultWeek">
      <div
        v-if="sm.isAdminMode"
        style="display: flex;background-color: black;"
      >
        <div style="flex: 1 1 30vw;">
          Global loop time
        </div>
        <VueTimepicker

          :value="loopTimeStr"
          input-width="100%"
          format="mm:ss"
          hide-clear-button
          style="margin-bottom: 10px;flex: auto;"
          @change="setLoopTimeStr"
        />
      </div>
      <WeekEditor
        v-model="agenda.defaultWeek"
        @input="$emit('input', agenda)"
      />
    </div>
    <div v-else>
      <button @click="addAgendaException">
        + Ajout d'une exception
      </button>
      <div class="exceptionTable">
        <template v-for="v of agenda.agendaExceptionList">
          <button
            :key="v.name"
            @click="editName(v)"
          >
            {{ v.name }} (edit)
          </button>
          <DateRangeComp
            :key="v.name"
            v-model="v.dates"
            @input="$emit('input', agenda)"
          />
          <DayEditor
            :key="v.name"
            v-model="v.dayValue"
            @input="$emit('input', agenda)"
          />
          <button
            :key="v.name"
            style="background: red"
            @click="removeAgendaException(v.name)"
          >
            <img src="img/trash.svg">
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Prop, Vue } from 'vue-property-decorator'
import WeekEditor from '@/components/WeekEditor.vue'
import VueTimepicker from 'vue2-timepicker/src/vue-timepicker.vue'
import DayEditor from '@/components/DayEditor.vue'
import DateRangeComp from '@/components/DateRange.vue'

import {
  createAgendaException,
  Agenda,
  AgendaException
} from '@/API/ServerAPI'
import { ServerModel } from '@/API/ServerModel'

@Component({
  components: {
    WeekEditor,
    DayEditor,
    DateRangeComp,
    VueTimepicker
  }
})
export default class AgendaEditor extends Vue {
  @Prop({ required: true })
    agenda!: Agenda

  showDefaultWeek = true
  // mounted ():void {

  // }

  get sm(): ServerModel {
    return (this.$root as any).sm
  }

  get loopTimeStr() {
    let ts = this.agenda.loopTimeSec
    if (ts === undefined) { return 'mm:ss' }
    ts = Math.floor(ts)
    const m = Math.floor(ts / 60)
    const s = ts % 60
    const twoDig = (n: number) => {
      return ('0' + n).slice(-2)
    }
    return twoDig(m) + ':' + twoDig(s)
  }

  setLoopTimeStr(ev) {
    const n = '' + ev?.displayTime
    // if (!(n instanceof String)) { console.error('invalid loop str', n, ev); return }
    const spl = n.replace('mm', '0').replace('ss', '0').split(':')
    if (spl.length !== 2) return
    const m = parseInt(spl[0]) * 60
    const s = parseInt(spl[1])
    console.log('setting loop', m + s, spl)
    this.agenda.loopTimeSec = m + s
    this.$emit('input', this.agenda)
  }

  defaultAgendaExceptions () {
    return this.agenda.defaultWeek.exceptions
  }

  addAgendaException (): void {
    const en = prompt('new exception agenda')
    if (en) {
      this.agenda.agendaExceptionList.push(createAgendaException(en))
    }
    this.$emit('input', this.agenda)
  }

  removeAgendaException (name: string) {
    const idx = this.agenda.agendaExceptionList.findIndex(
      (e) => e.name === name
    )
    if (idx >= 0) {
      this.agenda.agendaExceptionList.splice(idx, 1)
    } else {
      console.error("can't remove exception", name)
    }
    this.$emit('input', this.agenda)
  }

  editName (e: AgendaException) {
    const en = prompt('exception name', e.name)
    if (en) {
      e.name = en
      this.$emit('input', this.agenda)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.exceptionTable {
  background: black;
  border: 1px solid black;
  display: grid;
  grid-template-columns: 1fr 3fr 6fr 1fr;
  grid-gap: 1px 1px;
}
.exceptionTable > * {
  background: grey;
  padding: 0px;
}
</style>
