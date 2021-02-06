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
    console.log(`Init ${tabContainerParent}`)
    this.tabContainerObserver = new MutationObserver(this.findTabContainerFromMutations.bind(this))
    this.tabContainerObserver.observe(tabContainerParent, {
      attributes: false,
      childList: true,
      characterData: false
    })
  }

  initTabObserver(tabStripElement) {
    this.tabObserver = new MutationObserver(this.findTabsFromMutations.bind(this))
    this.tabObserver.observe(tabStripElement, {
      attributes: false,
      childList: true,
      characterData: false
    })
  }

  onTabContainerCreated(tabContainerElement) {
    console.log('added container')

    this.tabContainer.eventHandlers['onCreated'].forEach(eventHandler => eventHandler(tabContainerElement))
    // Start observing for tab-buttons
    const tabStrip = tabContainerElement.querySelector('.tab-strip')
    // TODO: avoid searching whole document
    waitForElement('.tab-strip', 5000)
      .then(
        element => this.initTabObserver(element),
        error => console.error(error)
      )
  }

  onTabContainerRemoved(tabContainerElement) {
    // Start observing for tab-strips
    console.log('removed', tabContainerElement)
    this.tabContainer.eventHandlers['onRemoved'].forEach(eventHandler => eventHandler(tabContainerElement))
  }

  onTabCreated(tabElement)  {
    const getTabId = node => {
      // eg. <div class="tab" id="tab-15">
      const idParts = node.id.split('-')
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
}


function waitForElement(selector, rejectAfterMs) {
  return new Promise((resolve, reject) => {
    let element = document.querySelector(selector)
    if (element) {
      resolve(element)
    }

    const retryTime = 100
    let totalPollTime = 0

    var pollingTimer = setInterval(() => {
      element = document.querySelector(selector)
      if( element) {
        resolve(element)
      } else {
        totalPollTime += retryTime
        if (totalPollTime >= rejectAfterMs) {
          reject(`${selector} did not resolve in ${rejectAfterMs} ms`)
        }
      }
    }, retryTime)
  });
}


const vivaldiUI = new VivaldiUIObserver()

vivaldiUI.tabContainer.addCallback('onCreated', element => console.log('refreshTree'))
vivaldiUI.tabContainer.addCallback('onRemoved', element => console.log('startObservering'))
vivaldiUI.tabs.addCallback('onCreated', (element, tabId) => console.log('indent' + tabId))
console.log(vivaldiUI)

const retryTime = 100
const maxRetryAttempts = 5
var retryAttempts = 0

waitForElement('#main > .inner', 5000)
  .then(
    tabContainerParent => vivaldiUI.initTabContainerObserver(tabContainerParent),
    error => console.error(error)
  )
