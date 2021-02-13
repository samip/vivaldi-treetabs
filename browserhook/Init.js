
function log(...args) {
  messaging.send(...args)
}

function init() {
  console.log('https://github.com/samip/vivaldi-treetabs browser hook init')
  const uiControl = new UIController()
  const messaging = new Messaging(uiControl)
  uiControl.setMessagingFunction(message => messaging.send(message))
  const vivaldiUI = new VivaldiUIObserver()

  vivaldiUI.tabContainer.addCallback('onCreated', (_element) => {
    // Tab container is removed when browser enters full screen mode
    // and is rendered again when exiting full screen mode.
    // Ask extension to re-render tab indentantions after Tab container is created.
    messaging.send({command: 'RenderAllTabs'})
    uiControl.showRefreshViewButton()
  })

  vivaldiUI.tab.addCallback('onCreated', (element, tabId) => {
    // Commands were given to tab from extension before tab was rendered in UI,
    // run them now.
    uiControl.tab(tabId).runQueuedCommands(element)
  })

  messaging.init()
  vivaldiUI.init()
}

init()
