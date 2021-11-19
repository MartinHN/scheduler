import { Device } from './types'

const serverURL = window.location.hostname
const fromPort = window.location.port
const serverPort = fromPort.startsWith('808') ? '3003' : fromPort

export async function getJSON (path:string, d?:Device):Promise<any> {
  const requestOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }
  let url = serverURL
  let port = serverPort
  if (d !== undefined) {
    url = d.ip
    port = '' + d.port
  }

  console.log('http', requestOptions.method, path)
  const response = await fetch(`http://${url}:${port}/${path}`, requestOptions)
  if (!response.ok) { return {} }
  const data = await response.json()
  console.log('got', path, data)
  return data
}

export async function postJSON (path:string, data:any, d?:Device):Promise<Response> {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }
  let url = serverURL
  let port = serverPort
  if (d !== undefined) {
    url = d.ip
    port = '' + d.port
  }
  console.log('http', requestOptions.method, path)
  return await fetch(`http://${url}:${port}/${path}`, requestOptions)
}

export async function deleteJSON (path:string, d?:Device):Promise<Response> {
  const requestOptions = {
    method: 'DELETE'
  }
  let url = serverURL
  let port = serverPort
  if (d !== undefined) {
    url = d.ip
    port = '' + d.port
  }
  console.log('http', requestOptions.method)
  return await fetch(`http://${url}:${port}/${path}`, requestOptions)
}
