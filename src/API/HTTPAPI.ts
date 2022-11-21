import { Device } from './types'

const serverURL = window.location.hostname
const fromPort = window.location.port
const serverPort = fromPort.startsWith('808') ? '3003' : fromPort

async function fetchWithTimeout(resource, options = {} as any) {
  const timeout = options?.timeout ? options.timeout : 8000
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal
  })
  clearTimeout(id)
  return response
}

export function getSrvResURL(path: string): string {
  return `http://${serverURL}:${serverPort}/${path}`
}

export async function getJSON(path: string, d?: Device): Promise<any> {
  const requestOptions = {
    method: 'GET'
  }
  let url = serverURL
  let port = serverPort
  if (d !== undefined) {
    url = d.ip
    port = '' + d.port
  }

  console.log('http', requestOptions.method, path, url, port)
  const response = await fetch(`http://${url}:${port}/${path}`, requestOptions)
  if (!response.ok) { return {} }
  const data = await response.json()
  console.log('got', path, data)
  return data
}

export async function getText(path: string, d?: Device, timeout = 2000): Promise<any> {
  const requestOptions = {
    method: 'GET',
    cache: 'no-cache',
    timeout
  }
  let url = serverURL
  let port = serverPort
  if (d !== undefined) {
    url = d.ip
    port = '' + d.port
  }

  console.log('http', requestOptions.method, path, url, port)
  const response = await fetchWithTimeout(`http://${url}:${port}/${path}`, requestOptions)
  if (!response.ok) { return {} }
  const data = await response.text()
  console.log('got', path, data)
  return data
}

export async function postJSON(path: string, data: any, d?: Device): Promise<Response> {
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

export async function deleteJSON(path: string, d?: Device): Promise<Response> {
  const requestOptions = {
    method: 'DELETE'
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
