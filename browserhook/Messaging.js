class Messaging {

  constructor (port, uiControl) {
    this.uiControl = uiControl
    this.port = port

    if (port) {
      this.port.onDisconnect.addListener(port => console.log('Disconnect', port))
      this.port.onMessage.addListener(this.onReceived.bind(this))
    } else {
      throw new treeTabUserScriptError('Connection failed to extension failed')
    }
  }

  // Handle incoming command
  onReceived (request, _port) {
    switch (request.command) {

      // Indents tab by <indentLevel> steps.
      // @param tabId
      // @param indentLevel - how many steps tab needs to be indentedx
      case 'IndentTab':
        this.uiControl.tab(request.tabId).indentTab(request.indentLevel)
        break

      // Show or create 'Close child tabs' button in tab strip
      // @param tabId
      case 'ShowCloseChildrenButton':
        this.uiControl.tab(request.tabId).showCloseChildrenButton()
        break

      //Hide 'Close child tabs' button in tab strip
      // @param tabId
      case 'HideCloseChildrenButton':
        this.uiControl.tab(request.tabId).hideCloseChildrenButton()
        break

      // Delete tab-specific data after tab has been closed
      // @param tabId
      case 'FlushData':
        delete this.uiControl.tabs[request.tabId]
        break
      default:
        extLog('Invalid command', request.command)
        break
    }
  }

  send (command) {
    if (this.port) {
      this.port.postMessage(command)
    } else {
      console.error('Trying to send message without connection', command)
    }
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError)
    }
  }

  // Send log back to extension
  // Usage: window.messaging.log('what', 'ever', 33, { b:0 })
  log () {
    console.log.apply(console, arguments)
    this.send({log: arguments})
  }
}
