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

  // Send command to window via Chrome external messaging API
  send(window: Window) {
    const parameters = {...this.parameters, ...{command: this.command}}

    if (this.logEnabled) {
      console.table(parameters)
    }

    if (!window.isConnected()) {
      window.connect()
    }

    if (window.connection.sendMessage(parameters)) {
      console.error('Message couldn\'t be posted')
    }
  }


  // Commands received from browserhook
  static onReceived(request: any) {
    console.log('External message received', request)

    switch (request.command) {
    case 'CloseChildren':
      let tab = tabContainer.get(request.tabId)
      tab.removeChildren()
      break
    case 'RenderAllTabs':
      tabContainer.applyAll((tab: any) => tab.renderEverything())
      break
    default:
      console.error('Unknown command: ' + request.command)
      break
    }
  }
}

export type ResponseCallback = (response: any) => any
