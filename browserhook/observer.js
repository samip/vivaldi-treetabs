class VivaldiUIObserver {
  constructor() {
    this.tabContainerObserver = null
    this.tabObserver = null

    const addCallback = function(eventName, fn) {
      this.eventHandlers[eventName].push(fn)
    }

    this.tabs = {
      eventHandlers: {
        onCreated: []
      },
      addCallback: addCallback
    }

    this.tabContainer = {
      eventHandlers: {
        onCreated: [],
        onRemoved: []
      },
      addCallback: addCallback
    }
  }

  init() {
    initTabContainerObserver
  }

  initTabContainerObserver(tabContainerParent) {
    if (!tabContainerParent) {
      console.error('Missing observe target')
      return
    }

    this.tabContainerObserver = new MutationObserver(this.findTabContainerFromMutations.bind(this))
    this.tabContainerObserver.observe(tabContainerParent, {
      attributes: false,
      childList: true,
      characterData: false
    })
  }

  initTabObserver(tabStripElement) {
    if (!tabStripElement) {
      console.error('Missing tabstrip element')
      return
    }
  }

  onTabContainerCreated(tabContainerElement) {
    console.log('added')
    console.log(tabContainerElement)
    // Refresh tree

    this.tabContainer.eventHandlers['onCreated'].forEach(eventHandler => eventHandler(tabContainerElement))
    // Start observing for tab-buttons
    const tabStrip = tabContainerElement.querySelector('.tab-strip')
    console.log(tabStrip)
    console.log(tabContainerElement)
    this.initTabObserver(tabStrip)
  }

  onTabContainerRemoved(tabContainerElement) {
    // Start observing for tab-strips
    console.log('removed', tabContainerElement)
    this.tabContainer.eventHandlers['onRemoved'].forEach(eventHandler => eventHandler(tabContainerElement))
  }

  onTabCreated(tabElement)  {
    const getTabId = node => {
      const tabDiv = node.querySelector('.tab')
      // eg. <div class="tab" id="tab-15">
      const idParts = tabDiv.id.split('-')
      return (idParts.length === 2) ? parseInt(idParts[1]) : null
    }

    const id = getTabId(tabElement)
    if (id) {
      this.tabs.eventHandlers.onCreated.forEach(eventHandler => eventHandler(tabElement, id))
    }
  }

  /*
  -------------------
  | Finder methods
  -------------------
  */

  findTabContainerFromMutations(mutations) {
    const isTabContainer = node => node.id == 'tabs-tabbar-container'

    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => isTabContainer(node) && this.onTabContainerCreated(node))
      mutation.removedNodes.forEach(node => isTabContainer(node) && this.onTabContainerRemoved(node))
    })
  }

  findTabsFromMutations(mutations) {
    const findTabDiv = node => node.querySelector('.tab')

    mutations.forEach(mutation => {
      // Assume everything created under tab strip to be a tab
      mutation.addedNodes.forEach(node => {
        const tabDiv = findTabDiv(node)
        tabDiv && this.onTabCreated(tabDiv)
      })
    })
  }

  /*
  Helpers
  */

  static tabstripParentSelector() { return '#main > .inner' }
}




const vivaldiUI = new VivaldiUIObserver()

vivaldiUI.tabContainer.addCallback('onCreated', tabStripElement => console.log('refreshTree'))
vivaldiUI.tabContainer.addCallback('onRemoved', tabStripElement => console.log('startObservering'))
vivaldiUI.tabs.addCallback('onCreated', tabID => console.log('indent' + tabId))
console.log(vivaldiUI)

const retryTime = 100
const maxRetryAttempts = 5
var retryAttempts = 0

var checkExist = setInterval(function() {
  let tabStripParent = document.querySelector(VivaldiUIObserver.tabstripParentSelector())
  if (tabStripParent) {
    console.log("Exists!")
    clearInterval(checkExist)
    vivaldiUI.initTabContainerObserver(tabStripParent)
   } else {
     console.log("Does not exist")
     retryAttempts += 1
     if (retryAttempts >= maxRetryAttempts) {
       clearInterval(checkExist)
       console.log(`tabstripParentSelector was not found after ${retryAttempts} attempts`)
     }
   }
}, retryTime)
