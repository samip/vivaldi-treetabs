/*
Sends commands to browser hook
 */

export default class Command {
  command: string;
  browserExtensionId: string;
  parameters: object;

  constructor(command:string, parameters:object) {
    this.command = command;
    this.browserExtensionId = 'mpognobbkildjkofajifpdfhcoklimli';
    this.parameters = parameters;
  }


  send() {
    let logCommand = false;
    if (logCommand) {
      console.log(this.browserExtensionId, this.command, this.parameters);
    }
    let parameters = {...this.parameters, ...{command:this.command}};
    chrome.runtime.sendMessage(this.browserExtensionId, parameters);
  }

}
