/*
Messaging to and from BrowserHook
*/

import {tabContainer} from './TabContainer'

export default class Command {
  command: string
  browserExtensionId: string
  parameters: object
  port: chrome.runtime.Port
  logEnabled: boolean

  constructor(command:string, parameters:object) {
    this.command = command

    // browser.html extension id
    // Could this ever change?
    this.browserExtensionId = 'mpognobbkildjkofajifpdfhcoklimli' 
    this.parameters = parameters
    this.logEnabled = true

    if (!this.port) {
      try {
        this.port = this.connect()
        this.port.onMessage.addListener(this.onReceived)
      } catch(e) {
        throw e
      }
    }
  }

  connect(): chrome.runtime.Port {
    const port = chrome.runtime.connect(this.browserExtensionId)

    if (chrome.runtime.lastError) {
      throw new Error('Connect failed to browser.html. ' +
        'Is browserhook installed? chrome.runtime.lastError: ' + chrome.runtime.lastError)
    }

    return port
  }

  send(_callback?:ResponseCallback) {
    let parameters = {...this.parameters, ...{command: this.command}}

     if (this.logEnabled) {
      console.info('Sending command to browserhook: ' + this.browserExtensionId)
      console.table(parameters)
    }

    this.port.postMessage(parameters)
    if (chrome.runtime.lastError) {
      throw new Error('postMessage error: ' + chrome.runtime.lastError)
    }
  }

  /** Commands received from browserhook **/
  onReceived(request: any, port: chrome.runtime.Port) {
    console.log('External message received', request)

    switch (request.command) {
      case 'CloseChildren':
        let tab = tabContainer.get(request.tabId)
        if (tab) {
          tab.removeChildren()
        }
        break
      case 'RenderAllTabs':
        tabContainer.applyAll((tab: any) => tab.renderEverything())
        break
      case 'GetTabIndent':
        // Not used
        tab = tabContainer.get(request.tabId)
        if (tab) {
          port.postMessage({
            command: 'TabIndent',
            tabId: request.tabId,
            indent: tab.depth()
          })
        }
        break
      default:
        console.error('Unknown command from browserhook', request.command)
        break
    }
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError)
    }
  }

}
export type ResponseCallback = (response: any) => any
export type cb = (message: any, port: chrome.runtime.Port) => void
