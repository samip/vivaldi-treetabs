export default class Connection {

  private static instance: Connection

  private _port: chrome.runtime.Port
  private browserExtensionId: string

  private constructor() {
    // browser.html extension id
    // Could this ever change?
    this.browserExtensionId = 'mpognobbkildjkofajifpdfhcoklimli'
  }

  private init(msgCallback:onMessageCallback) {
    this._port = chrome.runtime.connect(this.browserExtensionId)
    this._port.onMessage.addListener(msgCallback)
    chrome.runtime.onConnect.addListener(x => console.log('Connected', x))
    this._port.onDisconnect.addListener((p) => { console.error('Disconnect from browserhook', p) })

    if (chrome.runtime.lastError) {
      console.error('Connecting to browserhook failed' + chrome.runtime.lastError)
    }
    console.log(this._port)
  }

  public get port(): chrome.runtime.Port {
    return this._port
  }

  static getConnection(msgCallback:onMessageCallback): Connection {
    if (!Connection.instance) {
      Connection.instance = new Connection()
      Connection.instance.init(msgCallback)
    }
    return Connection.instance
  }
}

export type onMessageCallback = (message: any) => any

