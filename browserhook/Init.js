





console.log('Browserhook loaded')
const messaging = new Messaging()
const vivaldiUI = new VivaldiUIObserver()
vivaldiUI.tabContainer.addCallback('onCreated', (element) => messaging.send({command: 'refreshTree' }))

vivaldiUI.tab.addCallback('onCreated', (element, tabId) => {
  messaging.send({command: 'GetTabIndent', tabId: tabId})
})

messaging.init()
vivaldiUI.init()
