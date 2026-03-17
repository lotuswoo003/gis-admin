import type { Component } from 'vue'

export interface MenuItemData {
  key: number | string
  label: string
  icon?: string | Component
  enable?: boolean
  isEnabled?: () => boolean
  func?: (event?: any) => void | Promise<void>
  commandName?: string
  callback?: (event: any) => void | Promise<any>
}
