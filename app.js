// import io from './lib/socket.io/weapp.socket.io'
import config from './config'
import { setLoginUrl } from './lib/page.auth'

global.regeneratorRuntime = require('./lib/regenerator/runtime-module')

App({
  onLaunch(options) {
    setLoginUrl(config.url.login)
  },

  onShow(options) {

  },

  onHide() {

  },

  onError(msg) {
    console.error("[APP ERROR]", msg)
  }
})