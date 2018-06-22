import consts from './consts'
import Session from './session'
import loginLib from './login'
import { RequestError } from './errors'
import { promisify } from './promisify'

const wxRequest = promisify(wx.request)

function request(options) {
  if (typeof options !== 'object') {
    return Promise.reject(new RequestError(consts.ERR_INVALID_PARAMS, '请求传参应为 object 类型，但实际传了 ' + (typeof options) + ' 类型'))
  }

  const originHeader = options.header

  let hasRetried = false

  // 先执行登录操作，再请求
  function doRequestWithLogin() {
    return loginLib.loginWithCode().then(doRequest)
  }

  // 实际进行请求
  function doRequest() {
    let authHeader = {}

    const session = Session.get()

    if (session) {
      authHeader = {
        'Accept': 'application/json',
        [consts.WX_HEADER_FLAG]: 1,
        [consts.WX_HEADER_SKEY]: session.skey
      }
    }

    return wxRequest({
      ...options,
      header: {
        ...originHeader,
        ...authHeader
      }
    }).then(response => {
      const data = response.data

      if ((data && data.code === -1) || response.statusCode === 401) {
        Session.clear()

        if (!hasRetried) {
          hasRetried = true
          return doRequestWithLogin()
        }

        return Promise.reject(new RequestError(data.error, '登录态已过期'))
      }

      return data
    })
  }

  // 开始进行请求
  return options.login ? doRequestWithLogin() : doRequest()
}

module.exports = { request }