class Messaging {
  constructor (port, uiControl) {
    this.uiControl = uiControl
    this.port = port
    this.alwaysRespond = true

    if (port) {
      this.port.onDisconnect.addListener(x => console.log('Disconnect', x))
      this.port.onMessage.addListener(this.onReceived.bind(this))
      this.port.postMessage('Moro ' + this.port.name)
    } else {
      throw new treeTabUserScriptError('Invalid port')
    }

  }

  // Handle incoming command
  onReceived (request, port) {
    let reply = 'ACK'

    switch (request.command) {
      // Indents tab by <indentLevel> steps.
      // @param tabId
      // @param indentLevel - how many steps tab needs to be indentedx
      case 'IndentTab':
        this.uiControl.tab(request.tabId).indentTab(request.indentLevel)
        break


      // Show or create 'Close child tabs' button in tab strip
      // @param TabId
      //
      case 'ShowCloseChildrenButton':
        this.uiControl.tab(request.tabId).showCloseChildrenButton()
        break

      //  Hide 'Close child tabs' button in tab strip
      // @param TabId
      case 'HideCloseChildrenButton':
        this.uiControl.tab(request.tabId).hideCloseChildrenButton()
        break
      default:
        reply = 'NACK'
        console.error('Invalid command: ' + request.command)
        console.log(request)
        break
    }
    if (this.alwaysRespond) {
      this.send(reply)
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

  log (logMessage, level) {
    this.send({command: 'log', message: logMessage, level: level})
  }
}
