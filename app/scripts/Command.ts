/*
Send command to Browserhook
 */

export default class Command {
  command: string;
  browserExtensionId: string;
  parameters: object;
  logEnabled: boolean;

  constructor(command:string, parameters:object) {
    this.command = command;
    this.browserExtensionId = 'mpognobbkildjkofajifpdfhcoklimli'; // browser.html
    this.parameters = parameters;
    this.logEnabled = true;
  }

  send(callback?:ResponseCallback) {
    let logEnabled = this.logEnabled;
    let parameters = {...this.parameters, ...{command:this.command}};

     if (logEnabled) {
      console.info('Sending command to extension :' + this.browserExtensionId);
      console.table(parameters);
    }

    chrome.runtime.sendMessage(this.browserExtensionId, parameters, {}, function(response:any) {
      if (logEnabled) {
        console.info('Response from command:', response);
        if (callback) {
          callback(response);
        }
      }
    });
  }

}

export type ResponseCallback = (response: any) => any;
