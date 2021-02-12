console.log('https://github.com/samip/vivaldi-treetabs browser hook init')

const tabControl = new TabControl()
const messaging = new Messaging(tabControl)
const vivaldiUI = new VivaldiUIObserver()

vivaldiUI.tabContainer.addCallback('onCreated', (element) => {
  messaging.send({command: 'refreshTree' })
})

vivaldiUI.tab.addCallback('onCreated', (element, tabId) => {
  console.log('TabElement created', element, tabId)
  console.log(tabControl)
  let cmds = tabControl.runQueuedTabCommands(tabId, element)
})

messaging.init()
vivaldiUI.init()
