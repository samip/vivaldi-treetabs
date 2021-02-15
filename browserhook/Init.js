function log(...args) {
  messaging.send(...args)
}

function initTreeTabUserScript(messagingPort) {
  console.log('https://github.com/samip/vivaldi-treetabs user script initialized')
  const uiControl = new uiController()
  window.messaging = new Messaging(messagingPort, uiControl)
  const vivaldiUI = new uiObserver()

  vivaldiUI.tabContainer.addCallback('onCreated', (element) => {
    // Tab container is removed when browser enters full screen mode
    // and is rendered again when exiting full screen mode.
    // Ask extension to re-render tab indentantions after Tab container is created.
    console.log(element, 'tabcontainer created')
    window.messaging.send({command: 'RenderAllTabs'})
    uiControl.showRefreshViewButton()
  })

  vivaldiUI.tab.addCallback('onCreated', (element, tabId) => {
    // Commands were given to tab from extension before tab element
    // was rendered in UI, run them now.
    uiControl.tab(tabId).setElement(element)
    uiControl.tab(tabId).runQueuedCommands(element)
  })

  vivaldiUI.init()

  // For debugging
  objects = {
    vivaldiUI: vivaldiUI,
    messaging: messaging,
    uiControl: uiControl
  }
  window.treeTabUserScript = objects
  return objects
}

class treeTabUserScriptError extends Error {
  constructor(message) {
    super(message)
    this.name = 'treeTabUserScriptError'
  }
}

chrome.runtime.onConnectExternal.addListener(port => {
  const windowId = window.vivaldiWindowId
  if (port.name === 'window-' + windowId) {
    console.info('Messaging port open for window', port.name)
    initTreeTabUserScript(port)
    console.log(window.treeTabUserScript)
  }
})
