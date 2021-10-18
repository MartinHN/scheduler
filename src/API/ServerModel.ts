import { Device, DeviceDic, Groups, newEmptyDevice, Group, createDefaultAgenda } from './ServerAPI'
import * as ServerAPI from '@/API/ServerAPI'
import ws from '../ws'

const allowedWSData = ['connectedDeviceList'] as string[]

export class ServerModel {
    connectedDeviceList=[] as Device[]
    knownDevices= {} as DeviceDic
    groups={} as Groups

    agendaFileNames=[] as string[]

    loadedAgenda = createDefaultAgenda();
    _hasLoadedFirst=false;

    constructor () {
      ws.init(this.newMessageFromWS.bind(this), undefined)
      this.loadDevices()
      this.loadGroups()
      this.loadAgendaNames()
      if (ws.isConnected())ws.send('server', { type: 'req', value: 'connectedDeviceList' })
      this.loadAgendaFromFile('default.json')
    }

    async loadDevices () :Promise<void> {
      const savedKnownDevices = await ServerAPI.getKnownDeviceList()
      const devs = {} as any
      for (const [k, v] of Object.entries(savedKnownDevices)) {
        devs[v.uuid] = newEmptyDevice(v.deviceName, v)
      }
      this.knownDevices = devs
    }

    async loadGroups () :Promise<void> {
      this.groups = await ServerAPI.getGroups()
    }

    async loadAgendaNames ():Promise<void> {
      const data = await ServerAPI.getAgendaNames() as string[]
      if (data !== undefined) {
        this.agendaFileNames = data
      }
    }

    newMessageFromWS (v:any):void {
      // set specific device info
      //   console.log('[ServerModel] new ws msg', v)
      if (v.type && v.type === 'resp') {
        const { uuid, deviceName, msg } = v
        let dev = this.knownDevices[uuid] as any
        if (!dev) {
          dev = this.connectedDeviceList.find(e => e.uuid === uuid)
        }
        if (dev) {
          const prop = msg.address.substr(1)
          const value = msg.args[0]
          const availableProps = Object.keys(dev) // ['rssi']
          //   console.log('new resp', prop, value)
          if (availableProps.includes(prop)) {
            (dev as any)[prop] = value
          } else {
            console.error('[ServerModel] unknown prop', prop, availableProps, msg)
          }
        } else {
          console.error('[ServerModel] unknown dev for resp', uuid, deviceName)
        }
        // server infos
      } else if (allowedWSData.includes(v.type)) {
        console.log('[ServerModel] new device list', v)
        const filled = v.data.map((d:Device) => newEmptyDevice(d.deviceName, d));
        (this as any)[v.type] = filled
      } else {
        console.error('[ServerModel] unkown msg', v, 'allowed are', allowedWSData)
      }
    }

    /// ////////// Helpers
    isDeviceConnected (uuid:string):boolean {
      for (const d of Object.values(this.connectedDeviceList)) {
        if (d.uuid === uuid) { return true }
      }
      return false
    }

    activateDevice (d:Device, b:boolean):void{
      d.activate = b
      this.sendDeviceEvent(d.uuid, { type: 'activate', value: b ? 1 : 0 })
    }

    sendDeviceEvent (uuid:string, event:any):void {
      if (event.type) { ws.send('deviceEvent', { uuid, event }) } else { console.error('[ServerModel] invalid event', event) }
    }

    devicesInGroup (g:Group):Device[] {
      return Object.values(this.knownDevices).filter(e => e.group === g.name)
    }

    async loadAgendaFromFile (n:string):Promise<void> {
      const newAg = await ServerAPI.getAgenda(n)
      if (newAg && newAg.defaultWeek) {
        console.log('dot agenda from server')
        this.loadedAgenda = newAg
        this.loadedAgenda.name = n.replace('.json', '')
      } else {
        console.error('cant load agenda', n)
      }
      this._hasLoadedFirst = true
    }

    async resetAgendas ():Promise<void> {
      await ServerAPI.resetAgendas()
      this.loadAgendaNames()
    }
}
