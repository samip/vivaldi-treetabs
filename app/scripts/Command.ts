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
    this.browserExtensionId = 'mpognobbkildjkofajifpdfhcoklimli'; // browser.html
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
    let logEnabled = this.logEnabled;
    let parameters = {...this.parameters, ...{command:this.command}};

     if (logEnabled) {
      console.info('Sending command to extension: ' + this.browserExtensionId);
      console.table(parameters);
    }

    this.port.postMessage(parameters);

    if (chrome.runtime.lastError) {
      throw new Error('postMessage error: ' + chrome.runtime.lastError);
    }
  }


  onReceived(request:any) {
    console.log('External message received', request);

    if (!request.command) {
      console.error('Missing command');
    }

    switch (request.command) {
      case 'CloseChildren':
        const node = tabContainer.get(request.tabId);

        if (node) {
          node.removeChildren();
        } else {
          console.error('Trying to close children of missing tab');
        }
        break;

      default:
        console.error('Unknown command from browserhook', request.command);
    }

  }

}

export type ResponseCallback = (response: any) => any;
