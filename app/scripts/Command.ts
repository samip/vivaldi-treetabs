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
    this.browserExtensionId = 'mpognobbkildjkofajifpdfhcoklimli';
    this.parameters = parameters;
    this.logEnabled = true;
  }

  send() {
    let logEnabled = this.logEnabled;
    if (logEnabled) {
      console.log(this.browserExtensionId, this.command, this.parameters);
    }
    let parameters = {...this.parameters, ...{command:this.command}};
    console.log(parameters, this.parameters, this.command);
    chrome.runtime.sendMessage(this.browserExtensionId, parameters, {}, function(response:any) {
      if (logEnabled) {
        console.log('Response from command:', response);
      }
    });
  }

}
