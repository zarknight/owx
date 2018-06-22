import { Session, promisify, setLoginUrl, loginWithCode, login, request } from './session/index'

const normalizeError = api => {
  return params => {
    return api(params).catch(e => {
      const err = e || {}

      let code = 'unknown_error'

      if (typeof err.code === 'number' || typeof err.code === 'string') {
        code = err.code
      } else if (err.type) {
        code = err.type
      }

      const desc = err.errMsg || err.desc || err.message || ''

      return Promise.reject({ code, desc })
    })
  }
}

const $login = params => {
  const session = Session.get()
  return normalizeError(session ? loginWithCode : login)(params)
}

const $request = params => {
  return normalizeError(request)(params)
}

module.exports = { Session, promisify, setLoginUrl, $login, $request }