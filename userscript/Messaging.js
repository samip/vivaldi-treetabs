class Messaging {

  constructor (port) {
    if (!port) {
      throw new treeTabUserScriptError('Connection to extension failed')
    }
    this.uiController = null
    this.port = this.addListeners(port)
  }

  addListeners (port) {
    port.onDisconnect.addListener(this.onDisconnected.bind(this))
    port.onMessage.addListener(this.onReceived.bind(this))
    return port
  }

  onDisconnected (port) {
    uninitiliaze()
    console.log('Port disconnected', port)
  }

  onReceived (request, _port) {
    switch (request.command) {
      // Indents tab by <indentLevel> steps.
      // @param tabId
      // @param indentLevel - how many steps tab needs to be indentedx
      case 'IndentTab':
        getTab(request.tabId).indentTab(request.indentLevel)
        break

      // Show or create 'Close child tabs' button in tab strip
      // @param tabId
      case 'ShowCloseChildrenButton':
        // tmp fix to missing button problem 

        // treetabs.messaging.send({command: 'RenderAllTabs'})
        getTab(request.tabId).showCloseChildrenButton()
        break

      // Hide 'Close child tabs' button in tab strip
      // @param tabId
      case 'HideCloseChildrenButton':
        getTab(request.tabId).hideCloseChildrenButton()
        break

      // Delete tab-specific data after tab has been closed
      // @param tabId
      case 'FlushData':
        // UIController.deleteTabReference(request.tabId)
        break

      default:
        extLog('Invalid command', request.command)
        break
    }
  }

  setUiController (uiController) {
    this.uiController = uiController.tab
  }

  send (command) {
    if (this.port) {
      this.port.postMessage(command)
    } else {
      throw new treeTabUserScriptError('Trying to send message without port')
    }

    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError)
    }
  }

  log () {
    // console.log.apply(console, arguments)
    arguments[1] && console.log(arguments[0])
    this.send({log: arguments})
  }
}
