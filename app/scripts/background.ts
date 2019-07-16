/*
    todo:
    tallenna tabien tilat ja mappaa ne käynnistyksen yhteydessä aukeaviin tabeihin
    Estä tabia aukeammasta keskelle treetä
    Tabin siirron käsittely

    dump tab id and index
    chrome.tabs.query({}, function(c) { c.forEach ( item => { console.log(item.id, item.index) })});

*/

// Enable chromereload by uncommenting this line:
import 'chromereload/devonly';
import Tab = chrome.tabs.Tab;
import Node from './Node';
import {NodeList, nodelist} from './NodeList';


let events:any = [];

function logEvent(id:number|undefined, type:any, param:any) {
  if (!id) {
    return;
  }
  if (typeof events[id] === 'undefined') {
    events[id] = [];
  }
  events[id].push( {'type': type, 'param': param, 'target':id });
}

const onInstalled = chrome.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion);
});


const onMessageExternal = chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    console.log('external received in background', request, sender);

    if (request.command) {
      switch (request.command) {
        case 'build':
          root.children = new NodeList;
          nodelist.build(root);
          console.log(nodelist.values);
          sendResponse({'nodelist': nodelist});
          break;
        case 'get':
          console.log(nodelist, root);
          sendResponse({'nodelist': nodelist});
          break;
        case 'show_ids':
          nodelist.values.forEach((node:Node) => {
            node.command('ShowId');
          });
          break;
      }
    }
  }
);


const onCommand = chrome.commands.onCommand.addListener(function(command) {
  let log = (message:string) => {
   let enabled = true;
   if (enabled) {
     console.log(message);
   }
  };
  log('Received command:' + command);
  switch (command) {
    case 'close-child-tabs':
      log('Close child tabs');
      break;
    default:
      console.error('Unknown command');
      break;
  }
});

const onCreated = chrome.tabs.onCreated.addListener((tab: Tab) => {
  let node = new Node(tab);

  // child tab created
  if (tab.openerTabId) {
    nodelist.add(node);
    let parentTab = nodelist.get(tab.openerTabId);
    if (!parentTab) {
      console.error('Parent '+ tab.openerTabId +' not found for ' + tab);
      let fixNode;
      chrome.tabs.get(tab.openerTabId, (tab:Tab) => {
        console.log(tab);
        let fixParent = root;

        fixNode = new Node(tab);
        if (tab.openerTabId) {
          let fixParent = nodelist.get(tab.openerTabId);
          if (!fixParent) {
            console.table(nodelist.values);
            console.error('Fix parent fail', fixParent, ' for ', tab);
          }
        }
        fixNode.parentTo(fixParent);
        nodelist.add(fixNode);
        node.parentTo(fixNode);
        node.command('IndentTab', {tabId: tab.id, indentLevel: node.depth()});
        console.log('Fixed', fixNode);
      });
    } else {
      node.parentTo(parentTab);
      console.log(node, node.depth());
      node.command('IndentTab', {tabId: tab.id, indentLevel: node.depth()});
    }
  } else {
    nodelist.add(node);
    node.parentTo(root);
    node.initialIndex = tab.index;
    node.waitingForRepositioning = true;
    console.log('Created ', node, ' parented to ', root);
    if (!root.children.get(node.id)) {
      console.error('Parenting failed');
    }
  }

});

const onAfterRemoval = chrome.tabs.onRemoved.addListener(function (tabId) {
    let node = nodelist.get(tabId);
    console.log('onRemoved' + tabId);
    if (!node) {
        // should never happen
        console.error('Tab [' + tabId + '] not in container', root);
        console.log('Container:', nodelist, 'root:', root);
        return;
    } else {
      console.log('Removed ' + tabId);
    }
    node.remove();
    nodelist.remove(node);
});



const onMoved = chrome.tabs.onMoved.addListener((tabId, moveInfo) => {
  let node:Node = nodelist.get(tabId);
  const correctEvent = node.initialIndex === moveInfo.fromIndex;

  if (node.waitingForRepositioning && correctEvent) {
    let searchBelow = moveInfo.toIndex; // search for spot below created tab
    console.log('Starting reparenting. Root state: ', root.children);

    let rootIndices:number[] = [];

    let processed = 0;
    let minIndex:number;


    chrome.tabs.get(tabId, (tab:Tab) => {
      console.log('New index:' + tab.index, 'searchbelow:' + searchBelow);

      root.children.values.forEach((item) => {
        chrome.tabs.get(item.id, (tab:Tab) => {
          if (tab.openerTabId) {
            console.error('Root not root', tab, nodelist.get(tab.id||0));
          }
          nodelist.get(item.id).command('appendAttribute', {attribute:'style', values: 'background-color:red'});
          let prev = --tab.index;
          if (prev > searchBelow) {
            if (!minIndex || prev <= minIndex) {
              minIndex = prev;
            }
          } else if (prev === searchBelow) {
            minIndex = prev;
            console.log('exit untouched at ', prev);
            return;
          }

          processed++;

          if (processed === root.children.values.length) {
            console.log(rootIndices, 'searchbelow:', searchBelow, 'found', minIndex);
            minIndex = (minIndex) ? minIndex : 999;
            chrome.tabs.move([item.id], {index: minIndex});
          }
        });

      });
    });
  }
});


const root = new Node();
nodelist.build(root);
console.log(root);

