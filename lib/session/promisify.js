const promisify = api => {
  return (options, ...params) => new Promise((resolve, reject) => {
    api({ ...options, success: resolve, fail: reject }, ...params)
  })
}

module.exports = { promisify }