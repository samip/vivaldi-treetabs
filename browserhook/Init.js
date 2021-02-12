console.log('https://github.com/samip/vivaldi-treetabs browser hook init')

const tabControl = new TabControl()
const messaging = new Messaging(tabControl)
const vivaldiUI = new VivaldiUIObserver()

vivaldiUI.tabContainer.addCallback('onCreated', (element) => {
  // Tab container is removed when browser enters full screen mode and rendered again when exiting full screen mode.
  // Ask extension to re-render tab indentantions after Tab container is created.
  messaging.send({command: 'RenderAllTabs'})
})

vivaldiUI.tab.addCallback('onCreated', (element, tabId) => {
  // Commands were given to tab from extension before tab was rendered in UI, run them now.
  tabControl.runQueuedTabCommands(tabId, element)
})

messaging.init()
vivaldiUI.init()
