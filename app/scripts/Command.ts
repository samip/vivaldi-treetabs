/*
Messaging to and from BrowserHook
*/

import {tabContainer} from './TabContainer'
import Window from './Window'
import {CommandParameters, CommandType} from './Types/CommandType'

export default class Command {
  command: string
  parameters: CommandParameters
  logEnabled: boolean

  constructor(command:string, parameters:CommandParameters) {
    this.command = command
    this.parameters = parameters
    this.logEnabled = true
  }

  /** Send command to window via Chrome external messaging API **/
  send(window: Window) {
    const parameters = {...this.parameters, ...{command: this.command}}

    if (this.logEnabled) {
      console.table(parameters)
    }

    if (!window.isConnected()) {
      window.connect()
    }

    // TODO: metodiin
    window.connection.port.postMessage(parameters)

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
