class Messaging {
  constructor(tabControl) {
    this.port = null
    this.tabControl = tabControl
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
        this.tabControl.IndentTab(request.tabId, request.indentLevel)
        break

      /*
       * Show tab's id next to it's title. Used in debugging only.
       *
       * @param tabId
       */
      case 'ShowId':
        this.tabControl.ShowId(request.tabId, request.indentLevel)
        break

      /* Append attribute to tab strip. Used in debugging only.
       */
      case 'appendAttribute':
        // UNSAFE
        this.tabControl.appendAttribute(request.tabId,
          request.attribute,
          request.value)
        break

      /* Show or create 'Close child tabs' button in tab strip
       * @param TabId
       */
      case 'ShowCloseChildrenButton':
        this.tabControl.showCloseChildrenButton(request.tabId)
        break

      /* Hide 'Close child tabs' button in tab strip
       * @param TabId
       */
      case 'HideCloseChildrenButton':
        this.tabControl.hideCloseChildrenButton(request.tabId)
        break

      default:
        console.error('Invalid command')
        console.log(request)
        // invalid command
        break
    }
  }

  send(msg) {
    if (this.port) {
      this.port.postMessage(msg)
      console.log('Send', msg)
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError)
      }
    } else {
      console.log(this)
      console.error('Trying to send without connection', msg)
    }
  }
}
