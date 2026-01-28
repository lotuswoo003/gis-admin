import type {MapContextListener } from './types'
interface ListenerParam {
  handler: Function
  once?: boolean
  scope?: Object
}

export default class EventBus {
  private events: Record<string, ListenerParam[]>

  constructor() {
    this.events = {}
  }

  on(eventName: string, callback: Function, scope?: any): MapContextListener {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }

    this.events[eventName].push({
      handler: callback,
      scope,
    })
    const that = this
    return {
      remove: () => that.off(eventName, callback),
    }
  }

  once(eventName: string, callback: Function): void {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }

    this.events[eventName].push({
      handler: callback,
      once: true,
    })
  }

  emit(eventName: string, ...args: any[]): void {
    if (!this.events[eventName]) return
    this.events[eventName].forEach((item, index) => {
      ;(item.scope ? item.handler.bind(item.scope) : item.handler)(...args)
      if (item.once) {
        this.events[eventName].splice(index, 1)
      }
    })
  }

  off(eventName: string, callback?: Function): void {
    if (this.events[eventName]) {
      if (callback) {
        this.events[eventName] = this.events[eventName].filter((v) => v.handler !== callback)
      } else {
        delete this.events[eventName]
      }
    }
  }

  clear() {
    this.events = {}
  }
}
