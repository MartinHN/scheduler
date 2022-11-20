import { Device, DeviceDic, Groups, newEmptyDevice, Group, createDefaultAgenda } from './ServerAPI'
import * as ServerAPI from '@/API/ServerAPI'
import ws from '../ws'

const allowedWSData = ['isInaugurationMode', 'isAgendaDisabled'] as string[]

export class ServerModel {
  connectedDeviceList = [] as Device[]
  knownDevices = {} as DeviceDic
  groups = {} as Groups

  agendaFileNames = [] as string[]

  isAdminMode = false;
  isConnectedToServer = false;

  loadedAgenda = createDefaultAgenda();
  _hasLoadedFirst = false;

  isInaugurationMode = false;
  isAgendaDisabled = false;

  isDNSActive = false;
  constructor() {
    ws.init(this.newMessageFromWS.bind(this), (isCon) => {
      if (isCon) {
        this.requestServerInfo()
        this.setDNSActive(this.isDNSActive)
        // this.setInaugurationMode(this.isInaugurationMode)
        // this.setAgendaDisabled(this.isAgendaDisabled)
      }
      this.isConnectedToServer = isCon
    })
    this.loadDevices()
    this.loadGroups()
    this.loadAgendaNames()
    this.requestServerInfo()

    this.loadAgendaFromFile('default.json')
  }

  requestServerInfo(): void {
    if (ws.isConnected()) {
      ws.send('server', { type: 'req', value: 'connectedDeviceList' })
      ws.send('server', { type: 'req', value: 'isInaugurationMode' })
      ws.send('server', { type: 'req', value: 'isAgendaDisabled' })
    }
  }

  async loadDevices(): Promise<void> {
    const savedKnownDevices = await ServerAPI.getKnownDeviceDic()
    const devs = {} as any
    for (const [k, v] of Object.entries(savedKnownDevices)) {
      // const f = JSON.parse(JSON.stringify(v))
      // // ignore live
      // const liveP = ['activate', 'rssi']
      // liveP.map(e => { if (f[e] !== undefined) delete f[e] })

      devs[v.uuid] = newEmptyDevice(v.deviceName, v)
    }
    this.knownDevices = devs
  }

  async loadGroups(): Promise<void> {
    this.groups = await ServerAPI.getGroups()
  }

  async loadAgendaNames(): Promise<void> {
    const data = await ServerAPI.getAgendaNames() as string[]
    if (data !== undefined) {
      this.agendaFileNames = data
    } else {
      console.error('no agenda names')
    }
  }

  newMessageFromWS(v: any): void {
    // set specific device info
    console.log('[ServerModel] new ws msg', v)
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
        console.log('new resp', prop, value)
        if (availableProps.includes(prop)) {
          (dev as any)[prop] = value
          dev.lastTimeModified = new Date()
        } else {
          console.error('[ServerModel] unknown prop', prop, availableProps, msg)
        }
      } else {
        console.error('[ServerModel] unknown dev for resp', uuid, deviceName)
      }
      // server infos
    } else if (v.type === 'connectedDeviceList') {
      console.log('[ServerModel] new device list', v)
      const filled = v.data.map((d: Device) => newEmptyDevice(d.deviceName, d))
      this.connectedDeviceList = filled
      // this.loadDevices()
    } else if (allowedWSData.includes(v.type)) {
      console.log('[ServerModel] new allowed param', v);
      (this as any)[v.type] = v.data
    } else {
      console.error('[ServerModel] unkown msg', v, 'allowed are', allowedWSData)
    }
  }

  /// ////////// Helpers

  setInaugurationMode(b): void {
    this.isInaugurationMode = b
    ws.send('server', { type: 'isInaugurationMode', value: b ? 1 : 0 })
  }

  setAgendaDisabled(b: boolean) {
    this.isAgendaDisabled = b
    ws.send('server', { type: 'isAgendaDisabled', value: b ? 1 : 0 })
  }

  setDNSActive(b): void {
    this.isDNSActive = b
    ws.send('server', { type: 'isDNSActive', value: b ? 1 : 0 })
  }

  isDeviceConnected(uuid: string): boolean {
    for (const d of Object.values(this.connectedDeviceList)) {
      if (d.uuid === uuid) { return true }
    }
    return false
  }

  activateDevice(d: Device, b: boolean): void {
    d.activate = b
    this.sendDeviceEvent(d.uuid, { type: 'activate', value: b ? 1 : 0 })
  }

  setDeviceNiceName(d: Device, nname: string): void {
    d.niceName = nname
    this.sendDeviceEvent(d.uuid, { type: 'niceName', value: nname })
    ServerAPI.saveKnownDeviceDic(this.knownDevices)
  }

  dateToStr(dd: Date): string {
    const d = new Date(dd)
    let month = '' + (d.getMonth() + 1)
    const year = '' + d.getFullYear()
    let day = '' + d.getDate()
    let hours = '' + d.getHours()
    let min = '' + d.getMinutes()
    let sec = '' + d.getSeconds()
    if (month.length < 2) { month = '0' + month }
    if (day.length < 2) { day = '0' + day }
    if (hours.length < 2) { hours = '0' + hours }
    if (min.length < 2) { min = '0' + min }
    if (sec.length < 2) { sec = '0' + sec }

    return day + '/' + month + '/' + year + ' ' + hours + ':' + min + ':' + sec
  }

  syncAllDeviceTimes() {
    for (const d of Object.values(this.knownDevices)) {
      this.setDeviceTimeStr(d, new Date())
    }
  }

  setDeviceTimeStr(d: Device, dat: Date): void {
    this.sendDeviceEvent(d.uuid, { type: 'setTimeStr', value: this.dateToStr(dat) })
  }

  setDeviceHostName(d: Device, nname: string): void {
    d.deviceName = nname
    this.sendDeviceEvent(d.uuid, { type: 'hostName', value: nname })
  }

  rebootDevice(d: Device): void {
    this.sendDeviceEvent(d.uuid, { type: 'reboot' })
  }

  sendDeviceEvent(uuid: string, event: any): void {
    if (event.type) { ws.send('deviceEvent', { uuid, event }) } else { console.error('[ServerModel] invalid event', event) }
  }

  devicesInGroup(g: Group): Device[] {
    return Object.values(this.knownDevices).filter(e => e.group === g.name)
  }

  async loadAgendaFromFile(n: string): Promise<void> {
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

  async deleteAgenda(name: string): Promise<void> {
    await ServerAPI.deleteAgenda(name)
    await this.loadAgendaNames()
    if (name === this.loadedAgenda?.name) {
      console.warn('forcing reload agenda', name)
      const newToLoad = this.agendaFileNames[0] || 'default.json'
      this.loadAgendaFromFile(newToLoad)
    }
  }

  async resetAgendas(): Promise<void> {
    await ServerAPI.resetAgendas()
    await this.loadAgendaNames()
  }
}
