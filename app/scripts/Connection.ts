export default class Connection {

  public port: chrome.runtime.Port

  addListeners() {
    chrome.runtime.onConnect.addListener(Connection.onConnected)
    this.port.onDisconnect.addListener(this.onDisconnect)
    this.port.onMessage.addListener(this.onReceived)
  }

  static onConnected(port: chrome.runtime.Port) {
    console.log('Connected port', port)
  }

  onReceived(request: any) {
    console.log('Received message', request)
  }


  onDisconnect(port: chrome.runtime.Port) {
    console.log('Port disconnected', port)
  }

  /*
   * ConnectInfo is used to set port name
   */
  connect(info?: chrome.runtime.ConnectInfo) {
    const extId = 'mpognobbkildjkofajifpdfhcoklimli'
    this.port = chrome.runtime.connect(extId, info)
    chrome.runtime.connect(info)

    if (chrome.runtime.lastError) {
      throw new Error('Connect failed to browser.html.'
        + 'Is browserhook installed? chrome.runtime.lastError: '
        + chrome.runtime.lastError)
    }
    this.addListeners()
  }
}

export type onMessageCallback = (message: any) => any
