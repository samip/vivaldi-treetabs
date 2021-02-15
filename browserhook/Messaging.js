class Messaging {

  constructor (port, uiControl) {
    this.uiControl = uiControl
    this.port = port
    this.alwaysRespond = false

    if (port) {
      this.addListeners()
      this.send('OK')
    } else {
      throw new treeTabUserScriptError('Invalid port')
    }

  }
  addListeners() {
    this.port.onDisconnect.addListener(x => console.log('Disconnect', x))
    this.port.onMessage.addListener(this.onReceived.bind(this))
    if (this.uiControl) {
      this.uiControl.setMessagingFunction(message => this.send(message))
    }
  }

  reconnect() {
    const extId = 'plakklklcjfeifjiodkjmgmbiljebfec'
    this.port.disconnect()

    this.port = chrome.runtime.connect(extId, {name: this.port.name})
    if (chrome.runtime.lastError) {
      console.error('Reconnect failed: ' + chrome.runtime.lastError)
      return false
    }

    this.addListeners()
    this.sendOkMessage()
    return true
  }

  sendOkMessage() {
    this.sendOkMessage()
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

  send (msg, reconnected) {
    reconnected = true // disable reconnect for now
    if (this.port) {
      this.port.postMessage(msg)
      if (chrome.runtime.lastError) {
        if (reconnected) {
          console.error(chrome.runtime.lastError)
        } else {
          this.reconnect()
          this.send(msg, true)
        }
      }
    } else {
      console.error('Trying to send message without connection', msg)
    }
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError)
    }
  }

}
