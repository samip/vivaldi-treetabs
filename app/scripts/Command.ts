/*
Messaging to and from BrowserHook
*/

import {tabContainer} from './TabContainer';

export default class Command {
  command: string;
  browserExtensionId: string;
  parameters: object;
  port: chrome.runtime.Port;
  logEnabled: boolean;

  constructor(command:string, parameters:object) {
    this.command = command;

    // browser.html extension id
    // Can it change?
    this.browserExtensionId = 'mpognobbkildjkofajifpdfhcoklimli'; 
    this.parameters = parameters;
    this.logEnabled = true;

    if (!this.port) {
      try {
        this.port = this.connect();
        this.port.onMessage.addListener(this.onReceived);
      } catch(e) {
        throw e;
      }
    }
  }

  connect(): chrome.runtime.Port {
    const port = chrome.runtime.connect(this.browserExtensionId);

    if (chrome.runtime.lastError) {
      throw new Error('Connect failed to browser.html. ' +
        'Is browserhook installed? chrome.runtime.lastError: ' + chrome.runtime.lastError);
    }

    return port;
  }

  send(callback?:ResponseCallback) {
    let parameters = {...this.parameters, ...{command: this.command}};

     if (this.logEnabled) {
      console.info('Sending command to extension: ' + this.browserExtensionId);
      console.table(parameters);
    }

    this.port.postMessage(parameters);
    if (chrome.runtime.lastError) {
      throw new Error('postMessage error: ' + chrome.runtime.lastError);
    }
  }

  onReceived(request: any, port: chrome.runtime.Port) {
    console.log('External message received', request)

    switch (request.command) {
      case 'CloseChildren':
        let node = tabContainer.get(request.tabId);

        if (node) {
          node.removeChildren();
        } else {
          console.error('Trying to close children of missing tab');
        }
        break;
      case 'RenderAllTabs':
        tabContainer.applyAll(node => node.renderIndentation())
        break
      case 'GetTabIndent':
        node = tabContainer.get(request.tabId);
        if (node) {
          port.postMessage({
            command: 'TabIndent',
            tabId: request.tabId,
            indent: node.depth()
          })
        }
        break
      default:
        console.error('Unknown command from browserhook', request.command);
    }

  }

}
// export type MessageResponse = (message:any, port:Port) => void
export type ResponseCallback = (response: any) => any;
export type cb = (message: any, port: chrome.runtime.Port) => void;
