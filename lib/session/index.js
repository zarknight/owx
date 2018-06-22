import consts from './consts'
import errors from './errors'
import Session from './session'
import loginLib from './login'
import requestLib from './request'
import promisifyLib from './promisify'

const exports = {
  Session,
  ...errors,
  ...loginLib,
  ...requestLib,
  ...promisifyLib,
}

// 导出错误类型码
Object.keys(consts).forEach(key => {
  if (key.indexOf('ERR_') === 0) {
    exports[key] = consts[key]
  }
})

module.exports = exports