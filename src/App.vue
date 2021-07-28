<template>
<div id=app>
      <template v-if="shouldDisplayNav" >
        <div  id="nav">

          <router-link tag=button to="/">Home</router-link>
            <template v-if="shouldDisplayAdvanced" >

            <router-link tag=button to="/AgendasView">Agendas</router-link>
            <router-link tag=button to="/DevicesView">Devices</router-link>
            <router-link tag=button to="/GroupView">Group</router-link>
            </template>
    </div>
      </template>
  <router-view >

  </router-view>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Route } from 'vue-router'

@Component({
  components: {

  }
})
export default class AppComp extends Vue {
  shouldDisplayNav = true
  shouldDisplayAdvanced = false
  mounted () {
    const fun = (to:Route, from:Route):any => {
      this.shouldDisplayNav = (to.name !== 'Home')
      this.shouldDisplayAdvanced = this.shouldDisplayNav && (to.name !== 'InaugurationView')
    }
    this.$router.afterEach(fun.bind(this))
    fun(this.$router.currentRoute, this.$router.currentRoute)
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;

  /* display:flex;
  flex-direction: column; */

   display:grid;
   grid-template-rows: 50px auto;
  /* grid-auto-columns:auto; */
  min-height: 100vh;

}

body{
background: rgb(44, 44, 44);
color:white
}
#app *:not(.customFont){
  font-size:1em;
}

#nav {
  /* padding: 5px; */
  width:100vw;
  display:flex;
  justify-content: space-evenly;
  text-align: center;
}

/* #nav div {
  font-weight: bold;
  color: black;
    background: grey;
      display: flex;
    justify-content: space-evenly;
    flex-direction: column;
    margin:3px;
    border-radius: 5px;

}
*/
#nav .router-link-exact-active {

 background: rgb(255, 102, 0);
}

button:not(.active){
background: white;
opacity: .7;
}

button.active{
background: rgb(255, 102, 0);
}
button{
  font-size: 1em;

  border-radius: 5px;
  min-height:30px;
  min-width:50px;
  margin-bottom:5px;
  width:100%
}

#app select{
  min-height:50px;
  font-size:1em;
  border-radius: 5px;
  margin-bottom:5px;
}
 div{
  width:100%;

}

input{
  min-height:30px;
  min-width:50px;
  margin-bottom:5px;
  width:inherit;
}

</style>
