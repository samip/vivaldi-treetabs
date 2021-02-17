
class UIController {

  constructor () {
    this.tabs = {}
    this.messagingFunction = null
  }

  setMessagingFunction (messagingFunction) {
    this.messagingFunction = messagingFunction
  }

  tab (tabId) {
    if (!this.tabs[tabId]) {
      this.tabs[tabId] = new TabCommand(tabId, this.getElement(tabId))
      this.tabs[tabId].setMessagingFunction(this.messagingFunction)
    } else {
      this.tabs[tabId].setElement(this.getElement(tabId))
    }

    return this.tabs[tabId]
  }

  showRefreshViewButton () {
    const buttonId = 'refresh-tab-tree'
    // Busted
    const existing = document.getElementById(buttonId)
    if (existing) {
      return this
    }

    const target = document.querySelector('#tabs-container > .toolbar')
    const button = document.createElement('button')

    button.innerText = 'Refresh'
    button.id = 'refresh-tab-tree'
    button.classList = 'button-toolbar refresh-tab-tree'

    button.addEventListener('click', (_event) => {
      this.messagingFunction({ command: 'RenderAllTabs' })
    })

    target.appendChild(button)
    return this
  }

  getElement (tabId) {
    return document.getElementById('tab-' + tabId)
  }

}
