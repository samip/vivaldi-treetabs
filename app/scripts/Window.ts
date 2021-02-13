import Tab from './Tab'
import Connection from './Connection'

export default class Window {

  id: number
  window: chrome.windows.Window // https://developers.chrome.com/extensions/windows
  root: Tab
  connection: Connection

  constructor(id:number, chromeWindow:chrome.windows.Window) {
    this.id = id
    this.window = chromeWindow
    // Every tab in window is descendant of this
    this.root = new Tab()
  }

  static init(chromeWindow:chrome.windows.Window) {
    const window = new Window(chromeWindow.id, chromeWindow)
    window.connect()
    window.connection.port.postMessage({ command: 'Handshake' })
    return window
  }

  connect() {
    this.connection = new Connection()
    // TODO: catch error
    this.connection.connect({ name: `window-${this.id}` })
  }


  isConnected() : boolean {
    return this.connection !== undefined
  }

}
