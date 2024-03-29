import { Device, DeviceDic, Groups, newEmptyDevice, Group, createDefaultAgenda } from './ServerAPI'
import * as ServerAPI from '@/API/ServerAPI'
import { LoraDevice, LoraDeviceArray, LoraDeviceFile, LoraDeviceInstance, LoraDeviceType } from '@/API/types/LoraDevice'

import ws from '../ws'

const allowedWSData = ['isInaugurationMode', 'isAgendaDisabled', 'loraIsSendingPing', 'knownLoraDevices', 'deviceAreSyncedFromWifi', 'loraIsCheckingAgendas', 'loraIsSyncingAgendas', 'serverSyncStatus'] as string[]

export function isLoraDevice(dev: LoraDevice | Device) {
  return (dev as any).deviceType !== undefined
}

export function getUuidForAnyDevice(dev: LoraDevice | Device) {
  if (isLoraDevice(dev)) { return LoraDeviceInstance.getUuid(dev as LoraDevice) }
  return (dev as Device).uuid
}
export class ServerModel {
  connectedDeviceList = [] as Device[]
  knownDevices = {} as DeviceDic
  groups = {} as Groups

  agendaFileNames = [] as string[]

  isAdminMode = false
  isConnectedToServer = false

  loadedAgenda = createDefaultAgenda()
  loadedAgendaNextChange = ''
  nextSiteChange = ''
  _hasLoadedFirst = false

  isInaugurationMode = false
  inaugurationHasControl = false
  isAgendaDisabled = false

  serverSyncStatus = ''
  // lora
  knownLoraDevices = new Array<LoraDeviceInstance>()
  loraIsSendingPing = false
  loraIsSyncingAgendas = false
  loraIsCheckingAgendas = true
  deviceAreSyncedFromWifi = true
  loraIsDisablingWifi = true

  isDNSActive = false
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
    this.loadLoraDevices()
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
      // lora
      ws.send('lora', { type: 'req', value: 'loraIsSendingPing' })
      ws.send('lora', { type: 'req', value: 'loraIsSyncingAgendas' })
      ws.send('lora', { type: 'req', value: 'loraIsCheckingAgendas' })
      ws.send('lora', { type: 'req', value: 'deviceAreSyncedFromWifi' })
      ws.send('lora', { type: 'req', value: 'knownLoraDevices' })
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

  async loadLoraDevices(keepMetaData = false) {
    const savedLoraKnownDevices = await ServerAPI.getKnownLoraDevices()
    const loraDevs = [] as Array<LoraDeviceInstance>
    for (const [k, v] of Object.entries(savedLoraKnownDevices)) {
      // const f = JSON.parse(JSON.stringify(v))
      // // ignore live
      // const liveP = ['activate', 'rssi']
      // liveP.map(e => { if (f[e] !== undefined) delete f[e] })

      loraDevs.push(LoraDeviceInstance.create(v, keepMetaData))
    }
    this.knownLoraDevices = loraDevs
  }

  async loadGroups(): Promise<void> {
    this.groups = await ServerAPI.getGroups()
    await this.updateNextSiteChange()
  }

  async loadAgendaNames(): Promise<void> {
    const data = await ServerAPI.getAgendaNames() as string[]
    if (data !== undefined) {
      this.agendaFileNames = data
    } else {
      console.error('no agenda names')
    }
  }

  async startFullAgSync(b: boolean) {
    ws.send('server', { type: 'startFullAgSync', value: b ? 1 : 0 })
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
    } else if (v.type === 'loraPong') {
      const uuid = v.data.uuid
      const loraDev = this.knownLoraDevices.find(e => LoraDeviceInstance.getUuid(e) === uuid)
      if (!loraDev) {
        console.error('lora device not found for roundtrip', uuid)
        return
      }

      const time = v.data.time
      const activeState = v.data.activeState
      console.warn('got lora roundtrip', time, uuid)
      loraDev._lastSeen = new Date()
      loraDev._lastRoundtrip = time
      loraDev._isAgendaInSync = !!v.data.isAgendaInSync
      loraDev._isActive = activeState > 0
    } else if (allowedWSData.includes(v.type)) {
      console.log('[ServerModel] new allowed param', v);
      (this as any)[v.type] = v.data
    } else {
      console.error('[ServerModel] unkown msg', v, 'allowed are', allowedWSData)
    }
  }

  /// ////////// Helpers

  setInaugurationMode(b): void {
    this.inaugurationHasControl = true
    this.isInaugurationMode = b
    ws.send('server', { type: 'isInaugurationMode', value: b ? 1 : 0 })
  }

  setAgendaDisabled(b: boolean) {
    if (!b) { this.inaugurationHasControl = false }
    this.isAgendaDisabled = b
    ws.send('server', { type: 'isAgendaDisabled', value: b ? 1 : 0 })
  }

  setDNSActive(b): void {
    this.isDNSActive = b
    ws.send('server', { type: 'isDNSActive', value: b ? 1 : 0 })
  }

  setLoraTestEnabled(b) {
    this.loraIsSendingPing = b
    ws.send('lora', { type: 'loraIsSendingPing', value: b ? 1 : 0 })
  }

  setLoraIsSyncingAgendas(b) {
    this.loraIsSyncingAgendas = b
    ws.send('lora', { type: 'loraIsSyncingAgendas', value: b ? 1 : 0 })
  }

  setLoraIsCheckingAgendas(b) {
    this.loraIsCheckingAgendas = b
    ws.send('lora', { type: 'loraIsCheckingAgendas', value: b ? 1 : 0 })
  }

  setLoraDeviceAreSyncedFromWifi(b) {
    this.deviceAreSyncedFromWifi = b
    ws.send('lora', { type: 'deviceAreSyncedFromWifi', value: b ? 1 : 0 })
  }

  setLoraIsDisablingWifi(b) {
    this.loraIsDisablingWifi = b
    ws.send('lora', { type: 'loraIsDisablingWifi', value: b ? 1 : 0 })
  }

  activateLoraDevices(devices: Array<LoraDevice>, isActive: boolean) {
    for (const d of devices) { d._targetActiveLoraValue = isActive }
    ws.send('lora', { type: 'activate', value: { devices, isActive } })
  }

  sendKeepPingingDevice(device: LoraDevice, shouldPing: boolean) {
    ws.send('lora', { type: 'keepPingingDevice', value: { device, shouldPing: shouldPing ? 1 : 0 } })
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
    ServerAPI.saveKnownDeviceDic(this.knownDevices).catch(console.error)
  }

  syncAllDeviceTimes() {
    for (const d of Object.values(this.knownDevices)) {
      this.setDeviceTimeStr(d, new Date())
    }
  }

  setDeviceTimeStr(d: Device, dat: Date): void {
    this.sendDeviceEvent(d.uuid, { type: 'setTimeStr', value: ServerAPI.dateToStr(dat) })
  }

  async setDeviceHostName(d: Device, nname: string): Promise<void> {
    d.deviceName = nname
    this.sendDeviceEvent(d.uuid, { type: 'hostName', value: nname })
    const olduuid = d.uuid
    if (!this.knownDevices[olduuid]) { console.error('did miss something here'); return }
    delete this.knownDevices[olduuid]
    d.uuid = nname.replace('.local', '')
    this.knownDevices[d.uuid] = d
    await ServerAPI.saveKnownDeviceDic(this.knownDevices).catch(console.error)
  }

  rebootDevice(d: Device): void {
    this.sendDeviceEvent(d.uuid, { type: 'reboot' })
  }

  sendDeviceEvent(uuid: string, event: any): void {
    if (event.type) { ws.send('deviceEvent', { uuid, event }) } else { console.error('[ServerModel] invalid event', event) }
  }

  showLora = false
  getAllDevicesList(): Array<Device | LoraDevice> {
    if (!this.showLora) { return [...Object.values(this.knownDevices)] } else return [...Object.values(this.knownLoraDevices)]
  }

  devicesInGroup(g: Group): Array<Device | LoraDevice> {
    return this.getAllDevicesList().filter(e => e.group === g.name)
  }

  async isAgendaSync(d: Device): Promise<boolean> {
    console.warn('check ag sync')
    const gname = d.group
    const aname = this.groups[gname]?.agendaFileName
    // const savedAg = await ServerAPI.getAgendaMd5(aname)
    // const minSaved = JSON.stringify(savedAg, null, 0)
    // const savedMd5 = createHash('md5').update(minSaved).digest('hex').trim()
    const savedMd5 = await ServerAPI.getAgendaMd5(aname)
    // console.warn('got saved ag md5')

    const trueMd5 = await ServerAPI.getAgendaMd5ForDevice(d)
    console.warn('got both ag md5')
    const inSync = savedMd5 === trueMd5
    if (!inSync) {
      console.warn('ag out of sync ', savedMd5, trueMd5)
      let trueAg
      try {
        trueAg = await ServerAPI.getAgenda(aname)
      } catch (e) {
        console.error('could not fetch agenda', aname, ' for ', d.deviceName, e)
      }
      if (trueAg) {
        console.warn('updating agenda for ', d.deviceName)
        await ServerAPI.saveAgenda(aname, trueAg)
      }
    } else { console.log('ag in sync') }
    return inSync
  }

  async loadAgendaFromFile(n: string): Promise<void> {
    const newAg = await ServerAPI.getAgenda(n)
    if (newAg && newAg.defaultWeek) {
      console.log('got agenda from server')
      this.loadedAgenda = newAg
      this.loadedAgenda.name = n.replace('.json', '')
      this.loadedAgendaNextChange = await this.getDisplayableNextAgendaChange(new Date(), n)
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

  async updateNextSiteChange() {
    this.nextSiteChange = await this.getDisplayableNextSiteChange(new Date())
  }

  async saveAgenda(name: string, agendaFile: ServerAPI.Agenda): Promise<void> {
    await ServerAPI.saveAgenda(name, agendaFile)
    this.loadedAgendaNextChange = await this.getDisplayableNextAgendaChange(new Date(), this.loadedAgenda.name)
    this.updateNextSiteChange()
  }

  async getAllUsedAgendas() {
    const res = {} as { [id: string]: ServerAPI.Agenda }
    for (const g of Object.values(this.groups)) {
      const agName = g.agendaFileName
      if (!Object.keys(res).includes(agName)) {
        try {
          const ag = await ServerAPI.getAgenda(agName)
          res[agName] = ag
        } catch (e) {
          console.error("can't get used agenda for ", agName, e)
        }
      }
    }
    return res
  }

  async getNextAgendaChange(fromD = new Date(), forAgendaName: string) {
    const res = {
      isValid: false,
      willBeOn: false,
      changeDate: new Date(0)
    }
    let ag
    try {
      ag = await ServerAPI.getAgenda(forAgendaName)
    } catch (e) {
      console.error('could not get agenda', forAgendaName)
    }
    const ch = ServerAPI.getNextChangeDateFrom(fromD, ag)
    if (!ch.isValid) { return res }
    res.isValid = true
    res.willBeOn = ch.willBeOn
    res.changeDate = ServerAPI.dateFromDayAndHourString(ch.dateString, ch.hourString)
    return res
  }

  async getNextSiteChange(fromD = new Date()) {
    const agChanges = {
      isValid: false,
      willBeOn: false,
      agendaNames: new Array<{ agName: string, willBeOn: boolean }>(),
      changeDate: new Date(0)
    }
    let allAg = {} as { [id: string]: ServerAPI.Agenda }
    try {
      allAg = await this.getAllUsedAgendas()
    } catch (e) {
      console.error("can't fetch agendas", e)
    }
    let minDate = undefined as Date | undefined
    for (const [agName, ag] of Object.entries(allAg)) {
      const ch = ServerAPI.getNextChangeDateFrom(fromD, ag)
      if (ch.isValid) {
        // console.log('p0', ch.dateString, ch.hourString)
        const chDate = ServerAPI.dateFromDayAndHourString(ch.dateString, ch.hourString)
        if ((minDate === undefined) || (minDate >= chDate)) {
          const appendGroup = (minDate !== undefined) && (minDate === chDate)
          minDate = chDate
          agChanges.changeDate = chDate
          const newCh = { agName, willBeOn: ch.willBeOn }
          if (appendGroup) {
            agChanges.agendaNames.push(newCh)
          } else {
            agChanges.isValid = true
            agChanges.agendaNames = [newCh]
          }
        }
      }
    }

    const res = {
      isValid: false,
      groupChangesOn: new Array<string>(),
      groupChangesOff: new Array<string>(),
      changeDate: new Date(0)
    }
    if (!agChanges.isValid) { return res }
    // console.log('p1', agChanges)
    for (const n of agChanges.agendaNames) {
      const groupForAg = Object.values(this.groups)?.filter(e => e.agendaFileName === n.agName)
      for (const g of groupForAg) {
        if (n.willBeOn) { res.groupChangesOn.push(g.name) } else { res.groupChangesOff.push(g.name) }
      }
    }
    if (!res.groupChangesOn.length && !res.groupChangesOff.length) { console.error('!!!!! no group linked to agendas WTF???????'); return res }
    res.isValid = true
    res.changeDate = agChanges.changeDate
    // console.log('p2', res)
    return res
  }

  async getDisplayableNextAgendaChange(fromD = new Date(), forAgendaName: string) {
    const ch = await this.getNextAgendaChange(fromD, forAgendaName)
    if (!ch.isValid) return 'pas de changements programmés'
    const niceDate = ServerAPI.dateDayToString(ch.changeDate) + ' à ' + ServerAPI.dateToHourString(ch.changeDate)
    const res = 'cet agenda ' + (ch.willBeOn ? "s'activera" : "s'eteindra") + ' le ' + niceDate
    return res
  }

  async getDisplayableNextSiteChange(fromD?: Date): Promise<string> {
    const ch = await this.getNextSiteChange(fromD)
    if (!ch.isValid) return 'pas de changements programmés'
    console.log('got', ch)
    let groupsConcerned = ''
    let actionConcerned = ''
    if (ch.groupChangesOn.length && !ch.groupChangesOff.length) {
      actionConcerned = "s'activera"
      const all = ch.groupChangesOn.length === Object.keys(this.groups).length
      groupsConcerned = all ? '' : ch.groupChangesOn.join(',')
    } else if (ch.groupChangesOff.length && !ch.groupChangesOn.length) {
      actionConcerned = "s'eteindra"
      const all = ch.groupChangesOff.length === Object.keys(this.groups).length
      groupsConcerned = all ? '' : ch.groupChangesOff.join(',')
    }
    const niceDate = ServerAPI.dateDayToString(ch.changeDate) + ' à ' + ServerAPI.dateToHourString(ch.changeDate)
    let res = 'le site ' + actionConcerned + ' le ' + niceDate
    if (groupsConcerned.length) {
      res += '(' + groupsConcerned + ')'
    }
    return res
  }

  async resetAgendas(): Promise<void> {
    await ServerAPI.resetAgendas()
    await this.loadAgendaNames()
  }
}
