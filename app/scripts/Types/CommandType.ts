export interface CommandParameters {
  tabId?: number | undefined,
  indentLevel?: number
}

export enum CommandType {
  CloseChildren = 'CloseChildren',
  RenderAllTabs = 'RenderAllTabs',
  IndentTab = 'IndentTab',
  ShowCloseChildrenButton = 'ShowCloseChildrenButton',
  HideCloseChildrenButton = 'HideCloseChildrenButton'
}
