class Messaging {
  constructor(tabControl) {
    this.port = null
    this.uiControl = tabControl
  }

  init() {
    chrome.runtime.onConnectExternal.addListener(this.onConnected.bind(this))
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError)
    }
  }

  onConnected(port) {
    this.port = port
    this.port.onMessage.addListener(this.onReceived.bind(this))
    console.log('Connected to browserhook', port)
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
      let a = this.uiControl.tab(request.tabId).hideCloseChildrenButton()
      console.log(a)
      break

    default:
      console.error('Invalid command: ' + request.command)
      break
    }
  }

  send(msg) {
    if (this.port) {
      this.port.postMessage(msg)
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError)
      }
    } else {
      console.error('Trying to send message without connection', msg)
    }
  }
}
