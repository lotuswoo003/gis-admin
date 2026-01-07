/**
 * 用户信息 Store
 * @description 管理用户信息、组织ID、权限等
 */

import { defineStore } from 'pinia'

/** 用户信息接口 */
export interface UserInfo {
  /** 用户 ID */
  id: string
  /** 用户名 */
  username: string
  /** 组织 ID - 可选，管理端可能没有 */
  organizationId?: string
  /** 组织名称 */
  organizationName?: string
  /** 权限码列表 */
  permissions?: string[]
  /** 用户角色 */
  role?: string
  /** 真实姓名 */
  realName?: string
  /** 邮箱 */
  email?: string
  /** 手机号 */
  phone?: string
}

/** 用户 Store 状态 */
interface UserState {
  /** 用户信息 */
  userInfo: UserInfo | null
}

/**
 * 用户 Store
 */
export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userInfo: null
  }),

  getters: {
    /**
     * 获取当前用户的组织 ID
     * @returns 组织 ID，如果未登录则返回 undefined
     */
    currentOrganizationId(): string | undefined {
      return this.userInfo?.organizationId
    },

    /**
     * 获取当前用户的权限列表
     * @returns 权限码数组
     */
    currentPermissions(): string[] {
      return this.userInfo?.permissions || []
    },

    /**
     * 检查用户是否已登录
     * @returns 是否已登录
     */
    isLoggedIn(): boolean {
      return this.userInfo !== null
    }
  },

  actions: {
    /**
     * 设置用户信息（登录时调用）
     * @param userInfo 用户信息
     */
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo

      // 持久化到 localStorage（可选）
      try {
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
      } catch (error) {
        console.error('保存用户信息到 localStorage 失败:', error)
      }
    },

    /**
     * 清除用户信息（登出时调用）
     */
    clearUserInfo() {
      this.userInfo = null

      // 清除 localStorage
      try {
        localStorage.removeItem('userInfo')
      } catch (error) {
        console.error('清除 localStorage 用户信息失败:', error)
      }
    },

    /**
     * 从 localStorage 恢复用户信息
     * @description 应用初始化时调用
     */
    restoreUserInfo() {
      try {
        const userInfoStr = localStorage.getItem('userInfo')
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr) as UserInfo
          this.userInfo = userInfo
        }
      } catch (error) {
        console.error('从 localStorage 恢复用户信息失败:', error)
        this.clearUserInfo()
      }
    }
  }
})
