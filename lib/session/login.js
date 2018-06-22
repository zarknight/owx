import consts from './consts'
import Session from './session'
import { LoginError } from './errors'
import { promisify } from './promisify'

const wxLogin = promisify(wx.login)
const wxGetUserInfo = promisify(wx.getUserInfo)
const wxRequest = promisify(wx.request)
const defaultOptions = {
  method: 'GET',
  loginUrl: null,
}

/**
 * @method
 * 设置登录URL
 * @param {String} loginUrl 登录地址
 */
const setLoginUrl = loginUrl => {
  defaultOptions.loginUrl = loginUrl
}

/**
 * 微信登录，获取 code 和 encryptData
 */
const getWxLoginResult = () => {
  return wxLogin().then(loginResult => wxGetUserInfo().then(userResult => ({
    code: loginResult.code,
    encryptedData: userResult.encryptedData,
    iv: userResult.iv
  }))).catch(err => {
    const errMsg = err.errMsg || ''

    let error = null

    if (errMsg.indexOf('login:fail') === 0) {
      error = new LoginError(consts.ERR_WX_LOGIN_FAILED, '微信登录失败，请检查网络状态')
    } else {
      error = new LoginError(consts.ERR_WX_GET_USER_INFO, '获取微信用户信息失败，请检查网络状态')
    }

    error.detail = err

    return Promise.reject(error)
  })
}

/**
 * @method
 * 只通过 wx.login 的 code 进行登录
 * 已登录过的用户只需用 code 换取 openid 并从缓存中获取用户信息，无需每次通过 wx.getUserInfo 去获取用户信息
 * 
 * @param {Object}   options           登录配置
 * @param {string}   options.loginUrl  登录使用的 URL，服务器应该在这个 URL 上处理登录请求，建议配合服务端 SDK 使用
 * @param {string}   [options.method]  可选。请求使用的 HTTP 方法，默认为 GET
 */
const loginWithCode = options => {
  options = { ...defaultOptions, ...options }

  if (!defaultOptions.loginUrl) {
    return Promise.reject(new LoginError(consts.ERR_INVALID_PARAMS, '登录错误：缺少登录地址，请通过 setLoginUrl() 方法设置登录地址'))
  }

  return wxLogin().then(loginResult => wxRequest({
    method: options.method,
    url: options.loginUrl,
    header: {
      'Accept': 'application/json',
      [consts.WX_HEADER_FLAG]: 1,
      [consts.WX_HEADER_CODE]: loginResult.code
    }
  })).catch(() => {
    return Promise.reject(new LoginError(consts.ERR_LOGIN_FAILED, '登录失败，可能是网络错误或者服务器发生异常'))
  }).then(result => {
    const data = result.data

    if (!data || data.code !== 0 || !data.data || !data.data.skey) {
      return Promise.reject(new LoginError(consts.ERR_LOGIN_FAILED, '用户还未进行过授权登录，请先使用 login() 登录'))
    }

    const res = data.data

    if (!res || !res.userInfo) {
      return Promise.reject(new LoginError(consts.ERR_LOGIN_SESSION_NOT_RECEIVED, `登录失败(${data.error})：${data.message}`))
    }

    Session.set(res)

    return res.userInfo
  })
}

/**
 * @method
 * 进行服务器登录，以获得登录会话
 * 受限于微信的限制，本函数需要在 <button open-type="getUserInfo" bindgetuserinfo="bindGetUserInfo"></button> 的回调函数中调用
 * 需要先使用 <button> 弹窗，让用户接受授权，然后再安全调用 wx.getUserInfo 获取用户信息
 *
 * @param {Object}   options           登录配置
 * @param {string}   options.loginUrl  登录使用的 URL，服务器应该在这个 URL 上处理登录请求，建议配合服务端 SDK 使用
 * @param {string}   [options.method]  可选。请求使用的 HTTP 方法，默认为 GET
 */
const login = options => {
  options = { ...defaultOptions, ...options }

  if (!defaultOptions.loginUrl) {
    return Promise.reject(new LoginError(consts.ERR_INVALID_PARAMS, '登录错误：缺少登录地址，请通过 setLoginUrl() 方法设置登录地址'))
  }

  return getWxLoginResult().then(loginResult => wxRequest({
    method: options.method,
    url: options.loginUrl,
    header: {
      'Accept': 'application/json',
      [consts.WX_HEADER_FLAG]: 1,
      [consts.WX_HEADER_CODE]: loginResult.code,
      [consts.WX_HEADER_ENCRYPTED_DATA]: loginResult.encryptedData,
      [consts.WX_HEADER_IV]: loginResult.iv
    }
  })).catch(() => {
    return Promise.reject(new LoginError(consts.ERR_LOGIN_FAILED, '登录失败，可能是网络错误或者服务器发生异常'))
  }).then(result => {
    const data = result.data

    if (!data || data.code !== 0 || !data.data || !data.data.skey) {
      return Promise.reject(new LoginError(consts.ERR_LOGIN_FAILED, `响应错误，${JSON.stringify(data)}`))
    }

    const res = data.data

    if (!res || !res.userInfo) {
      return Promise.reject(new LoginError(consts.ERR_LOGIN_SESSION_NOT_RECEIVED, `登录失败[${data.error}] ${data.message}`))
    }

    Session.set(res)

    return res.userInfo
  })
}

module.exports = { setLoginUrl, loginWithCode, login }