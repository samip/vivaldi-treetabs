/*
Observes vivaldi's UI for changes, run callback when:
- Tab is created or tabContainer is created/destroyed

usage:
const observer = new UIObserver()
observer.tabContainer.addCallback('onCreated', function(element))
observer.tab.addCallback('onCreated', function(element))
*/

class UIObserver {

  constructor () {
    this.tabContainerObserver = null
    this.tabObserver = null

    const addCallback = function (eventName, fn) {
      this.eventHandlers[eventName].push(fn)
    }

    this.tab = {
      eventHandlers: {
        onCreated: [], // function(tabElement, tabId),
        onRemoved: []

      },
      addCallback: addCallback
    }

    this.tabContainer = {
      eventHandlers: {
        onCreated: [], // function(tabContainerElement)
        onRemoved: []  // function(tabContainerElement)
      },
      addCallback: addCallback
    }
  }

  init () {
    waitForElement('#main > .inner')
      .then(tabContainerParent => {
        this.initTabContainerObserver(tabContainerParent)
        const tabContainer = this.findTabContainerFromDocument()
        tabContainer && this.onTabContainerCreated(tabContainer)
      },
        error => console.error(error)
      )
  }

  initTabContainerObserver (tabContainerParent) {
    this.tabContainerObserver = new MutationObserver(
      this.findTabContainerFromMutations.bind(this)
    )
    this.tabContainerObserver.observe(tabContainerParent, this.observerSettings())
  }

  initTabObserver (tabStripElement) {
    this.tabObserver = new MutationObserver(
      this.findTabsFromMutations.bind(this)
    )
    this.tabObserver.observe(tabStripElement, this.observerSettings())
  }

  initRerenderObserver (target, callback) {
    if (!target.parentElement) {
      return
    }
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.id === target.id) {
            console.log('Rerender tab#'+node.id, node)
            callback(node, node.id)
          }
        })
      })
    })
    observer.observe(target.parentElement, this.observerSettings())
    return observer
  }

  observerSettings () {
    return {
      attributes: false,
      childList: true,
      characterData: false
    }
  }

  onTabContainerCreated (tabContainerElement) {
    this.tabContainer.eventHandlers['onCreated']
         .forEach(eventHandler => eventHandler(tabContainerElement))

    // TODO: avoid searching whole document, use tabContainerElement instead
    waitForElement('.tab-strip')
      .then(
        element => this.initTabObserver(element),
        error => console.error(error)
      )
    extLog('UIObserver: tabContainer created')
  }

  onTabContainerRemoved (tabContainerElement) {
    this.tabContainer.eventHandlers['onRemoved']
        .forEach(eventHandler => eventHandler(tabContainerElement))

    extLog('UIObserver: tabContainer removed')
  }

  onRerender (element, callback) {
    return this.initRerenderObserver(element, callback)
  }

  onTabRemoved (tabElement) {
    const id = this.getTabId(tabElement)
    if (id) {
      console.log('createdTab eventhandlers', this.tab)
      this.tab.eventHandlers.onRemoved.forEach(eventHandler =>
        eventHandler(tabElement, id)
      )
    }
  }

  onTabCreated (tabElement) {
    const id = this.getTabId(tabElement)
    if (id) {
      console.log('createdTab eventhandlers', this.tab)
      this.tab.eventHandlers.onCreated.forEach(eventHandler =>
        eventHandler(tabElement, id)
      )
    }
  }

  getTabId(node) {
    const idParts = node.id.split('-')
    return (idParts.length === 2) ? parseInt(idParts[1]) : null
  }

  // -------------------
  // Finder methods
  // -------------------

  findTabContainerFromMutations (mutations) {
    console.log('findTabContainerFromMutations', mutations)
    const isTabContainer = node => node.id === this.tabContainerElementId()

    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        isTabContainer(node)
        this.onTabContainerCreated(node)
      })

      mutation.removedNodes.forEach(node => {
        if (isTabContainer(node)) {
          this.onTabContainerRemoved(node)
        }
      })
    })
  }

  findTabContainerFromDocument () {
    return document.getElementById(this.tabContainerElementId())
  }

  findTabsFromMutations (mutations) {
    const findTabDiv = node => node.querySelector('.tab')

    console.log('mutations for findTabFromMutations', mutations)
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        const tabDiv = findTabDiv(node)
        if (tabDiv) {
          this.onTabCreated(tabDiv)
        }
      })

      mutation.removedNodes.forEach(node => {
        const tabDiv = findTabDiv(node)
        if (tabDiv) {
          this.onTabRemoved(tabDiv)
        }
      })
    })
  }

  tabContainerElementId () {
    return 'tabs-tabbar-container'
  }
}

function waitForElement (selector, rejectAfterMs) {
  rejectAfterMs = rejectAfterMs || 5000

  return new Promise((resolve, reject) => {
    let element = document.querySelector(selector)
    if (element) {
      resolve(element)
    }

    const retryTime = 100
    let totalPollTime = 0

    setInterval(() => {
      element = document.querySelector(selector)
      if (element) {
        resolve(element)
      } else {
        totalPollTime += retryTime
        if (totalPollTime >= rejectAfterMs) {
          reject(`${selector} did not resolve in ${rejectAfterMs} ms`)
        }
      }
    }, retryTime)
  })
}
