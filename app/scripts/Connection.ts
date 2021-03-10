import Command from './Command'

export default class Connection {

  private _port: chrome.runtime.Port
  private _isDisconnected: boolean
  private _isActive: boolean

  public get port() {
    return this._port
  }

  public get isDisconnected() {
    return this._isDisconnected
  }

  public get isActivE() {
    return this._isActive
  }

  constructor() {
    // Port is active after OK message is received from UserScript
    // and no disconnect event have been received
    this._isActive = false
  }

  addListeners() {
    this.port.onDisconnect.addListener(this.onDisconnect)
    this.port.onMessage.addListener(this.onMessage)
  }

  onMessage(message: any, _port:chrome.runtime.Port) {
    // TODO: Command parsing + definitions
    if (message == 'OK') {
      this._isActive = true
    } else if (message.log) {
      // const logLevels = ['INFO', 'DEBUG', 'VERBOSE']
      const logLevels = ['INFO', 'DEBUG', 'VERBOSE']
      const [first, ...rest] = message.log[0]
      if (logLevels.includes(first)) {
        console.log('Userscript:',...rest)
      } else {
        console.log('Userscript:', message.log)
      }

    } else if (message.command) {
      Command.onReceived(message)
    }
  }

  sendMessage(message: any) : boolean {
    this._port.postMessage(message)
    return chrome.runtime.lastError === undefined
  }

  onDisconnect(port: chrome.runtime.Port) {
    console.log('Port disconnected', port)
    this._isDisconnected = true
    this._isActive = false
  }

  // ConnectInfo is used to set port name
  // Current name format is: `window-<window.id>`
  // Name is used in user script to match messaging ports and browsing windows
  connect(info?: chrome.runtime.ConnectInfo) {
    // Vivaldi's extension id. Probably shouldn't be hardcoded.
    const extId = 'mpognobbkildjkofajifpdfhcoklimli'
    this._port = chrome.runtime.connect(extId, info)

    if (chrome.runtime.lastError) {
      throw new Error('Connect failed to browser.html.'
        + 'Is the userscript installed? chrome.runtime.lastError: '
        + chrome.runtime.lastError)
    } else {
      this.addListeners()
    }
  }

}

export type onMessageCallback = (message: any) => any
