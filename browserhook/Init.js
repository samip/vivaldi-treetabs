function log(...args) {
  messaging.send(...args)
}

function initTreeTabUserScript(messagingPort) {
  console.log('https://github.com/samip/vivaldi-treetabs user script initialized')
  const uiControl = new UIController()
  const messaging = new Messaging(messagingPort, uiControl)
  uiControl.setMessagingFunction(message => messaging.send(message))

  const vivaldiUI = new VivaldiUIObserver()

  vivaldiUI.tabContainer.addCallback('onCreated', (element) => {
    // Tab container is removed when browser enters full screen mode
    // and is rendered again when exiting full screen mode.
    // Ask extension to re-render tab indentantions after Tab container is created.
    messaging.send({command: 'RenderAllTabs'})
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
  return {
    vivaldiUI: vivaldiUI,
    messaging: messaging,
    uiControl: uiControl
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

    window.treeTabsUserScript = initTreeTabUserScript(port)
    window.lol = window.treeTabsUserScript.toString()
    window.testit = function() {
      console.log({asdasd:0})
    }
    console.log(window.treeTabsUserScript)
  }
})

window.addEventListener('DOMContentLoaded', (event) => {
  console.log(window)
  console.log(event)
  console.log('DOM fully loaded and parsed');
});
