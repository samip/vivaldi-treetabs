function log(...args) {
  messaging.send(...args)
}

function initTreeTabUserScript(messagingPort) {
  console.log('https://github.com/samip/vivaldi-treetabs user script initialized')
  window.uiControl = new UIController()
  window.messaging = new Messaging(messagingPort, window.uiControl)

  window.vivaldiUI = new VivaldiUIObserver()
  window.uiControl.setMessagingFunction(msg => window.messaging.send(msg))
  window.vivaldiUI.tabContainer.addCallback('onCreated', (element) => {
    // Tab container is removed when browser enters full screen mode
    // and is rendered again when exiting full screen mode.
    // Ask extension to re-render tab indentantions after Tab container is created.
    window.messaging.send({command: 'RenderAllTabs'})
    window.uiControl.showRefreshViewButton()
  })

  window.vivaldiUI.tab.addCallback('onCreated', (element, tabId) => {
    // Commands were given to tab from extension before tab element
    // was rendered in UI, run them now.
    window.uiControl.tab(tabId).setElement(element)
    window.uiControl.tab(tabId).runQueuedCommands(element)
  })

  window.vivaldiUI.init()

  window.messaging = messaging
  window.vivaldiUI = vivaldiUI
  window.uiControl = uiControl
  // For debugging
  return {
    vivaldiUI: window.vivaldiUI,
    messaging: window.messaging,
    uiControl: window.uiControl
  }
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
    console.info('Messaging port for new window', port.name)
    initTreeTabUserScript(port)
  }
})

window.addEventListener('DOMContentLoaded', (event) => {
  console.log(window)
  console.log(event)
  console.log('DOM fully loaded and parsed');
});
