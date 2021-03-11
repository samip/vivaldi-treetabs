import {tabContainer} from './TabContainer'
import Window from './Window'
import {CommandParameters, CommandType} from './Types/CommandType'

export default class Command {

  command: string
  parameters: CommandParameters
  logEnabled: boolean

  constructor(command:string, parameters?:CommandParameters) {
    this.command = command
    this.parameters = parameters || {}
    this.logEnabled = false
  }

  // Send command to window via Chrome external messaging API
  send(window: Window) {
    const parameters = {...this.parameters, ...{command: this.command}}

    if (!window.isConnected()) {
      window.connect()
      if (!window.isConnected()) {
        console.error('Cant connect to window', window)
        return
      }
    }

    const success = window.connection.sendMessage(parameters)
    if (!success) {
      console.error('Command could not be sent')
    }

    if (this.logEnabled) {
      console.table(parameters)
      const logLine = success ? 'Sent to' : 'Failed to send'
      console.log(logLine, window)
    }
  }

  // Commands received from userscript
  static onReceived(request: any) {
    console.log('Command received', request)

    switch (request.command) {
    case 'CloseChildren':
      let tab = tabContainer.tryGet(request.tabId)
      if (tab) {
        tab.removeChildren()
      }
      break
    case 'RenderAllTabs':
      tabContainer.applyAll((tab: any) => tab.renderEverything())
      break
    default:
      console.error(`Unknown command: ${request.command}`)
      break
    }
  }

}

export type ResponseCallback = (response: any) => any
