
const deviceURL = window.location.hostname
const fromPort = window.location.port
const devicePORT = fromPort === '8080' ? '3003' : fromPort

export async function getJSON (path:string):Promise<any> {
  const requestOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }
  console.log('http', requestOptions.method, path)
  const response = await fetch(`http://${deviceURL}:${devicePORT}/${path}`, requestOptions)
  if (!response.ok) { return {} }
  const data = await response.json()
  console.log('got', data)
  return data
}

export async function postJSON (path:string, data:any):Promise<Response> {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }
  console.log('http', requestOptions.method, path)
  return await fetch(`http://${deviceURL}:${devicePORT}/${path}`, requestOptions)
}

export async function deleteJSON (path:string):Promise<Response> {
  const requestOptions = {
    method: 'DELETE'
  }
  console.log('http', requestOptions.method)
  return await fetch(`http://${deviceURL}:${devicePORT}/${path}`, requestOptions)
}
