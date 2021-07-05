<template>
  <router-view id="app">

  </router-view>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;

  display:grid;
  grid-auto-columns:auto;

}

body{
background: rgb(44, 44, 44);
color:white
}
#app *{
  font-size:1em;
}

#nav {
  /* padding: 5px; */
}

#nav a {
  font-weight: bold;
  color: blue;
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

#nav a.router-link-exact-active {
  color: #42b983;
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
