export type ResourceCallback = (item: any) => any

export default abstract class Container {

  private _items : Map<number,any>

  constructor() {
    this._items = new Map<number, any>()
  }

  abstract initialize(): void

  get items() {
    return this._items
  }

  get count() {
    return this._items.size
  }

  add(item: any) {
    this._items.set(item.id, item)
  }

  get(id:number): any {
    let item = this._items.get(id)
    return item
  }

  getOrCreate(id:number, createFn:any) {
    if (this.get(id)) {
      return this.get(id)
    }

    const obj = createFn(id)
    this.add(obj)
    return obj
  }

  // todo: remove
  tryGet(id:number): any {
    return this._items.get(id)
  }

  isEmpty(): boolean {
    return this._items.size === 0
  }

  size(): number {
    return this._items.size
  }

  remove(item:any) {
    this._items.delete(item.id)
  }

  applyAll(callback: ResourceCallback): void {
    this._items.forEach((item: any) => callback(item))
  }

  getFirst(): any {
    return this._items.values().next().value
  }

}
