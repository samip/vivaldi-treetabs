import Node from './Node';
import rootNode from './Node';
export type NodeCallback = (node: Node) => any;

export class NodeList {

  nodes: { [s: string]: Node; } = <any>{};

  values: Node[] = [];
  keys: string[] = [];


  constructor() {

  }

  add(node: Node) {
    let key = '' + node.id;
    this.nodes[key] = node;
    this.keys.push(key);
    this.values.push(node);
  }


  applyRecursive(callback: NodeCallback) {
    let count = this.values.length;

    this.values.forEach( (childNode: Node) => {
      callback(childNode);
      return childNode.children.applyRecursive(callback);
    });
  }



  remove(node: Node) {
    let key = ''+node.id;
    let index = this.keys.indexOf(key, 0);
    this.keys.splice(index, 1);
    this.values.splice(index, 1);
    delete this.nodes[key];
  }

  get(id: number, callback?:any): Node {
    let useApi = true;
    if (useApi && callback) {
      chrome.tabs.get(id, callback);
    }
    return this.nodes['' + id];

  }


  build(root:Node) {
    chrome.tabs.query({currentWindow:true}, function(tabs) {
      let reparent_queue = new NodeList();

      tabs.forEach(function (item) {
          let add_tab_and_parents = function (node: Node): Node {
              let parent_id;
              if (node.parent) {
                parent_id = node.parent.id || null;
              } else {
                parent_id = null;
              }
              nodelist.add(node);

              // key[parent_id] => value[tab] populated with tabs waiting to be parented

              // No parent_id so it's top-level
              if (!parent_id) {
                  node.parentTo(root);
              }
              // Parent already in container -> reparent self to parent
              else if (nodelist.get(parent_id)) {
                  let parent_tabnode = nodelist.get(parent_id);
                  node.parentTo(parent_tabnode);
              }
              // Parent not in container yet -> queue self
              else {
                  reparent_queue.add(node);
              }
              // Current tab's child(ren) were created first -> reparent them
            if (node.id) {
              let queue_for_self = reparent_queue.get(node.id);
              if (queue_for_self) {
                queue_for_self.forEach(function (queuer: Node) {
                  return this.add_tab_and_parents(queuer); // return?
                });
              }
            }
              // foreach did not return -> no tabs in queue
              return node;
          }(new Node(item));
      }); // foreach
    });
  }

  restoreHierarchy() {
      chrome.storage.local.get(['tabs'], (result) => {
        let tabs = result.tabs;
        if (!tabs) {
          return;
        }
      });
  }

  /*
  Nodes sorted by index
   */
  getSorted() {
    return this.values.sort((a: Node, b: Node): number => {
      return a.tab.index - b.tab.index;
    });
  }

  isEmpty() {
    return this.values.length === 0;
  }

  store(windowId?:number) {
    // todo: 1 nodelist per window?
    interface SerializedTab {
      id?: Number;
      parentId: number;
      url?: string;
      title?: string;
    }


    const tabs: SerializedTab[] = [];

    this.values.forEach(function(node) {
      let parentId = node.parent ? node.parent_id : null;
      if (1) {
        let s: SerializedTab = {
          id: node.id,
          parentId: parentId,
          url: node.tab.url,
          title: node.tab.title,
        };
        tabs.push(s);
      }
    });
    chrome.storage.local.set({tabs: tabs}, function() {
        console.log('Settings saved');
        chrome.storage.local.get(['tabs'], (result) => {
          console.log(result);
        });
    });
  }

}

export let nodelist = new NodeList();
