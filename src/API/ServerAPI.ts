import { getJSON, postJSON, deleteJSON } from '@/API/HTTPAPI'

/// ////////////:
// Agendas

export interface HourRange {
    start: string;
    end: string;
  }

export function defaultHourRange ():HourRange {
  return { start: 'HH:00', end: 'HH:00' }
}

export interface DayType{
    type:string,
    hourRange:HourRange
  }

export function defaultDayType ():DayType {
  return { type: 'default', hourRange: defaultHourRange() }
}

export interface WeekHours{
  default:DayType
  lundi:DayType
  mardi:DayType
  mercredi:DayType
  jeudi:DayType
  vendredi:DayType
  samedi:DayType
  dimanche:DayType
}

export function defaultDefaultDay ():DayType {
  const res = defaultDayType()
  res.type = 'custom'
  return res
}

export function defaultWeekHour ():WeekHours {
  return {
    default: defaultDefaultDay(),
    lundi: defaultDayType(),
    mardi: defaultDayType(),
    mercredi: defaultDayType(),
    jeudi: defaultDayType(),
    vendredi: defaultDayType(),
    samedi: defaultDayType(),
    dimanche: defaultDayType()
  }
}

export interface AgendaZone{
    name:string
    dates:{start:Date, end:Date}
    weekHours:WeekHours
  }

export interface AgendaZones {[id:string]: AgendaZone}

export interface AgendaFile{
  agendas: AgendaZones
}

export function createAgendaZone (name:string):AgendaZone {
  return {
    name,
    dates: {
      start: new Date(),
      end: new Date()
    },
    weekHours: defaultWeekHour()
  }
}

export async function getAgendaNames () :Promise<any> {
  return await getJSON('agendaNames')
}

export async function getAgenda (name:string) :Promise<any> {
  return await getJSON(`agendas?n=${name}`)
}

export async function saveAgenda (name:string, agendaFile:AgendaFile):Promise<void> {
  await postJSON(`agendas?n=${name}`, agendaFile)
}

export async function deleteAgenda (name:string):Promise<void> {
  await deleteJSON(`agendas?n=${name}`)
}

/// ////////
// Devices

export interface Device {
    uuid:string;
    deviceName:string;
    niceName:string;
    ip:string;
    group:string;

    rssi:string;
    activate:boolean;

}

export function newEmptyDevice (deviceName:string, fields?:any):Device {
  fields = fields || {}
  return { deviceName, ip: fields.ip || 'null', niceName: fields.niceName || 'no niceName', rssi: fields.rssi || -1, activate: fields.activate || false, uuid: fields.uuid || 'auto@' + Math.ceil(Math.random() * 10e6), group: fields.group || '' }
}

export type DeviceDic = {[id:string]:Device};

export async function saveKnownDevices (knownDevices:DeviceDic):Promise<void> {
  postJSON('knownDevices', JSON.parse(JSON.stringify(knownDevices)))
}

export async function resetDevicesAndGroups () :Promise<void> {
  await postJSON('resetRasps', {})
}

export async function getKnownDeviceList () :Promise<DeviceDic> {
  return await getJSON('knownDevices') as DeviceDic
}

/// ///////////
// groups

export interface Group{
    name:string
    filename?:string
    devices:string[]
}

export interface Groups{
    [key:string] : Group
}

export async function saveGroups (groups:Groups):Promise<void> {
  await postJSON('groups', groups)
}

export async function getGroups ():Promise<Groups> {
  return await getJSON('groups')
}

export function newEmptyGroup (name:string, fields?:any):Group {
  fields = fields || {}
  return { name, devices: fields.devices || [] }
}