const CACHE_TIME = 86400000

function setOp(key, data) {
  try {
    wx.setStorageSync(key, {
      t: (+new Date()),
      d: data
    })
  } catch (e) {
  }
}

function getOp(key) {
  const data = wx.getStorageSync(key) || null

  if (data) {
    const tstamp = data.t
    const offset = (+new Date()) - tstamp

    if (offset <= CACHE_TIME) {
      return data.d
    }
  }

  return null
}

function setAuthor(id, val) {
  setOp(`_atr_${id}`, val)
}

function getAuthor(id) {
  return getOp(`_atr_${id}`)
}

module.exports = { setAuthor, getAuthor }