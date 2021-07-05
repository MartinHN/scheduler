
let connection !: WebSocket

function msg (m:string) {
  connection.send(JSON.stringify({ i: m }))
}
setInterval(() => {
  if (connection && (connection.readyState === WebSocket.CLOSED)) {
    setConnected(false)
    console.warn('trying to restart ws')
    wrap.start()
  }
}, 3000)

let isConnected = false
let onConChangeCB!: (b:boolean)=>void
let messageCB!: (b:any)=>void
function setConnected (b:boolean) {
  if (b === isConnected) return
  isConnected = b
  if (onConChangeCB) {
    onConChangeCB(isConnected)
  }
}

const wrap = {
  init (_messageCB:(m:any)=>void, _conChangeCB?:(b:boolean)=>void) :void{
    if (_conChangeCB) onConChangeCB = _conChangeCB
    messageCB = _messageCB
    this.start()
  },
  start () :void {
    if (connection && (connection.readyState !== WebSocket.CLOSED)) { console.error('ws already strarted'); return }
    console.log('Starting connection to WebSocket Server')
    const wsAddr = 'ws://' + window.location.hostname + ':3003'
    console.log('tryConnelkjjct ws :', wsAddr)
    connection = new WebSocket(wsAddr)

    connection.onmessage = function (event:MessageEvent) {
      console.log('new from serv', event.data)
      if (messageCB)messageCB(JSON.parse(event.data))
    }

    connection.onopen = function (event:Event) {
      setConnected(true)
      console.log(event)
      console.log('Successfully connected to the echo websocket server...')
      msg('hello')
      console.log('sent')
    }
    connection.onclose = (ev: CloseEvent) => {
      console.error('ws close', ev)
      setConnected(false)
      // setTimeout(this.start, 1000)
    }

    connection.onerror = (ev: Event) => {
      console.error('ws err', ev)
      setConnected(false)
      // setTimeout(this.start, 1000)
    }
    // return connection
  },
  ws: connection
}

export default wrap
