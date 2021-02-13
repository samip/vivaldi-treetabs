class Messaging {

  constructor(tabControl) {
    this.uiControl = tabControl
    this.extensionId = 'gclljglmpdnfmciiopkboelpehcnjdfp'
  }

  init() {
    chrome.runtime.onConnectExternal.addListener(this.onConnected.bind(this))
  }

  connect() {
    if (this.port) {
      this.port = this.connect(this.extensionId)
    }
  }

  onConnected(port) {
    this.port = port
    this.port.onDisconnect.addListener(x => console.log('Disconnect', x))
    this.port.onMessage.addListener(this.onReceived.bind(this))
  }

  /*
    Handle incoming command
  */
  onReceived(request) {
    switch (request.command) {
    /*
      Indents tab by <indentLevel> steps.
      @param tabId
      @param indentLevel - how many steps tab needs to be indentedx
     */
    case 'IndentTab':
      this.uiControl.tab(request.tabId).indentTab(request.indentLevel)
      break


    /* Show or create 'Close child tabs' button in tab strip
     * @param TabId
     */
    case 'ShowCloseChildrenButton':
      this.uiControl.tab(request.tabId).showCloseChildrenButton()
      break

    /* Hide 'Close child tabs' button in tab strip
     * @param TabId
     */
    case 'HideCloseChildrenButton':
      this.uiControl.tab(request.tabId).hideCloseChildrenButton()
      break

    default:
      console.error('Invalid command: ' + request.command)
      break
    }
  }

  send(msg) {
    if (this.port) {
      console.log(this.port)
      this.port.postMessage(msg)
    } else {
      console.error('Trying to send message without connection', msg)
    }
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError)
    }
  }
}
