let connection !: WebSocket

function msg(m: string) {
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
let onConChangeCB!: (b: boolean) => void
let messageCB!: (b: any) => void
function setConnected(b: boolean) {
  if (b === isConnected) return
  isConnected = b
  if (onConChangeCB) {
    onConChangeCB(isConnected)
  }
}

const wrap = {
  init(_messageCB: (m: any) => void, _conChangeCB?: (b: boolean) => void): void {
    if (_conChangeCB) onConChangeCB = _conChangeCB
    messageCB = _messageCB
    this.start()
  },
  isConnected(): boolean { return connection && (connection.readyState === WebSocket.OPEN) },
  start(): void {
    if (connection && (connection.readyState !== WebSocket.CLOSED)) { console.error('ws already strarted'); return }
    console.log('Starting connection to WebSocket Server')
    let loc = 'localhost'
    if (window.location.hostname) { loc = window.location.hostname }
    const wsAddr = 'ws://' + loc + ':3003'
    console.log('tryConnelkjjct ws :', wsAddr)
    connection = new WebSocket(wsAddr)

    connection.onmessage = function (event: MessageEvent) {
      // console.log('new from serv', event.data)
      //   let payload;
      //   if(event.type==="text")
      //   payload = JSON.parse(event.data)
      // else if
      if (messageCB) messageCB(JSON.parse(event.data))
    }

    connection.onopen = function (event: Event) {
      setConnected(true)
      console.log(event)
      console.log('Successfully connected to the  websocket server...')
      // msg('hello')
      // console.log('sent')
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
  send(addr: string, args: any): void {
    if (connection.readyState !== WebSocket.OPEN) {
      console.error('ws not opened , cant send ', addr)
      return
    }
    connection.send(JSON.stringify({ addr, args }))
  },
  ws: connection
}

export default wrap
