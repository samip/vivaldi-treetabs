/*
Messaging to and from BrowserHook
*/

import {tabContainer} from './TabContainer'
import Connection from './Connection'

export default class Command {
  command: string
  browserExtensionId: string
  parameters: object
  port: chrome.runtime.Port
  logEnabled: boolean

  constructor(command:string, parameters:object) {
    this.command = command
    this.parameters = parameters
    this.logEnabled = true
    this.port = Connection.getConnection(this.onReceived.bind(this)).port
    console.log(this.port)
  }

  send(_callback?:ResponseCallback) {
    let parameters = {...this.parameters, ...{command: this.command}}

     if (this.logEnabled) {
      console.table(parameters)
    }

    this.port.postMessage(parameters)
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError)
    }
  }

  /** Commands received from browserhook **/
  onReceived(request: any) {
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
          this.port.postMessage({
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
