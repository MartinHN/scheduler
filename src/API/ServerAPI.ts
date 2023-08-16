import { getJSON, getText, postJSON, deleteJSON } from '@/API/HTTPAPI'
import * as ScheduleTypes from './types/ScheduleTypes'
import { Agenda, WeekHours, HourRange } from './types/ScheduleTypes'
import { Device, Group, Groups, DeviceDic } from './types/DeviceTypes'
import { LoraState } from './types/LoraState'
export * from './types/ScheduleTypes'
export * from './types/DeviceTypes'

export async function getAgendaNames(): Promise<any> {
  return await getJSON('agendaNames')
}

export async function getAgenda(name: string): Promise<any> {
  return await getJSON(`agendas?n=${name}`)
}

export async function saveAgenda(name: string, agendaFile: Agenda): Promise<void> {
  await postJSON(`agendas?n=${name}`, agendaFile)
}

export async function deleteAgenda(name: string): Promise<void> {
  await deleteJSON(`agendas?n=${name}`)
}
export async function resetAgendas(): Promise<void> {
  await postJSON('resetAgendas', {})
}

/// ////////
// Devices

export async function saveKnownDeviceDic(knownDevices: DeviceDic): Promise<void> {
  postJSON('knownDevices', JSON.parse(JSON.stringify(knownDevices)))
}

export async function resetDevicesAndGroups(): Promise<void> {
  await postJSON('resetRasps', {})
}

export async function getKnownDeviceDic(): Promise<DeviceDic> {
  return await getJSON('knownDevices') as DeviceDic
}
export async function getCapForDevice(name: string, d: Device): Promise<any> {
  return await getJSON('cap/' + name, d)
}

export async function setCapForDevice(name: string, d: Device, data: any): Promise<void> {
  await postJSON('post/cap/' + name, data, d)
}

export async function getTimeInfoForDevice(d: Device): Promise<any> {
  return await getJSON('time', d)
}

export async function getAgendaInfoForDevice(d: Device): Promise<any> {
  return await getJSON('agendaFile', d)
}

export async function getRSSIFromDevice(d: Device, timeout = 1000): Promise<any> {
  return await getText('rssi', d, timeout)
}

/// ///////////
// groups

export async function saveGroups(groups: Groups): Promise<void> {
  await postJSON('groups', groups)
}

export async function getGroups(): Promise<Groups> {
  return await getJSON('groups')
}

// state
export async function saveState(state: { knownDevices: any, agendas: any, groups: any }): Promise<void> {
  await postJSON('state', state)
}

export async function getState(): Promise<Groups> {
  return await getJSON('state')
}

/// ////////////////
// Lora

export async function saveLoraState(state: LoraState): Promise<void> {
  await postJSON('lora/state', state)
}

export async function getLoraState(): Promise<LoraState> {
  return await getJSON('lora/state')
}
