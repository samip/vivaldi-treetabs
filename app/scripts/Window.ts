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
    return new Window(chromeWindow.id, chromeWindow)
  }

  connect() {
    const portName = `window-${this.id}`
    this.connection = new Connection()
    this.connection.connect({ name: portName })
  }

  isConnected() : boolean {
    return this.connection !== undefined
  }

}
