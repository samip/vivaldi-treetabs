import Tab from './Tab'
import Connection from './Connection'

export default class Window {

  id: number
  chromeWindow: chrome.windows.Window // https://developers.chrome.com/extensions/windows
  root: Tab
  connection: Connection

  constructor(id:number, chromeWindow:chrome.windows.Window) {
    this.id = id
    this.chromeWindow = chromeWindow
    this.root = new Tab()
  }

  static init(chromeWindow:chrome.windows.Window) {
    return new Window(chromeWindow.id, chromeWindow)
  }

  // Open messaging port between browser window and extension
  connect() {
    const portName = `window-${this.id}`
    this.connection = new Connection()
    this.connection.connect({ name: portName })
  }

  onRemoved() {
    this.root.applyDescendants(tab => tab.remove())
  }

  isConnected() : boolean {
    return this.connection !== undefined
  }

}
