import { $init, $digest } from '../../lib/page.data'
import { $login, $request, Session } from '../../lib/page.auth'
import config from '../../config'

const { regeneratorRuntime } = global

Page({

  data: {
    logged: false,
    userInfo: {}
  },

  async bindGetUserInfo(e) {
    if (this.data.logged) return

    try {
      const userInfo = await $login()

      this.data.logged = true;
      this.data.userInfo = userInfo;

      const res = await $request({ url: config.url.profile })

      console.log(">>>1>>> remote user:", res)

      $digest(this)
    } catch (err) {
      console.log("+++1+++ error:", err)
    }
  },

  async onLoad(options) {
    $init(this)

    try {
      const session = Session.get()

      if (session) {
        this.data.logged = true;
        this.data.userInfo = session.userInfo;

        const res = await $request({ url: config.url.profile })

        console.log(">>>2>>> remote user:", res)

        $digest(this)
      }
    } catch (err) {
      console.log("+++2+++ error:", err)
    }
  }

})