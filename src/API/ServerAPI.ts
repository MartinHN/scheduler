import { getJSON, postJSON, deleteJSON } from '@/API/HTTPAPI'
import * as ScheduleTypes from './types/ScheduleTypes'
import { Agenda, WeekHours, HourRange } from './types/ScheduleTypes'
import { Device, Group, Groups, DeviceDic } from './types/DeviceTypes'
export * from './types/ScheduleTypes'
export * from './types/DeviceTypes'

export async function getAgendaNames () :Promise<any> {
  return await getJSON('agendaNames')
}

export async function getAgenda (name:string) :Promise<any> {
  return await getJSON(`agendas?n=${name}`)
}

export async function saveAgenda (name:string, agendaFile:Agenda):Promise<void> {
  await postJSON(`agendas?n=${name}`, agendaFile)
}

export async function deleteAgenda (name:string):Promise<void> {
  await deleteJSON(`agendas?n=${name}`)
}
export async function resetAgendas () :Promise<void> {
  await postJSON('resetAgendas', {})
}

/// ////////
// Devices

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

export async function saveGroups (groups:Groups):Promise<void> {
  await postJSON('groups', groups)
}

export async function getGroups ():Promise<Groups> {
  return await getJSON('groups')
}
