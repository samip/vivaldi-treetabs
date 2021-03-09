export type ResourceCallback = (item: any) => any

export default abstract class Container {

  private items : Map<number,any>

  constructor() {
    this.items = new Map<number, any>()
  }

  abstract initFromChromeQuery(chromeQueryResponse: any[]): void
  abstract initialize(): void

  add(item: any) {
    this.items.set(item.id, window)
  }

  get(id:number): any {
    let item = this.items.get(id)
    return item
  }

  // todo: remove
  tryGet(id:number): any {
    return this.items.get(id)
  }

  isEmpty(): boolean {
    return this.items.size === 0
  }

  size(): number {
    return this.items.size
  }

  remove(item:any) {
    this.items.delete(item.id)
  }

  applyAll(callback: ResourceCallback): void {
    this.items.forEach((item: any) => callback(item))
  }

  getFirst(): any {
    return this.items.values().next().value
  }
}

