import Command from './Command'

export default class Connection {

  public port: chrome.runtime.Port
  private _disconnected: boolean

  public get disconnected() {
    return this._disconnected
  }

  addListeners() {
    this.port.onDisconnect.addListener(this.onDisconnect)
    this.port.onMessage.addListener(this.onMessage)
  }

  onMessage(message: any, _port:chrome.runtime.Port) {
    console.log('Received message', message)
    // TODO: parsi viestiä komento, tyypitä komento
    Command.onReceived(message)
  }

  sendMessage(message: any) : boolean {
    this.port.postMessage(message)
    return chrome.runtime.lastError !== undefined
  }

  onDisconnect(port: chrome.runtime.Port) {
    console.log('Port disconnected', port)
    this._disconnected = true
  }

  /*
   * ConnectInfo is used to set port name
   * Current name format is: `window-<window.id>`
   */
  connect(info?: chrome.runtime.ConnectInfo) {
    // Vivaldi's extension id. Probably shouldn't be hardcoded.
    const extId = 'mpognobbkildjkofajifpdfhcoklimli'
    this.port = chrome.runtime.connect(extId, info)

    if (chrome.runtime.lastError) {
      throw new Error('Connect failed to browser.html.'
        + 'Is browserhook installed? chrome.runtime.lastError: '
        + chrome.runtime.lastError)
    } else {
      this.addListeners()
    }
  }

}

export type onMessageCallback = (message: any) => any
