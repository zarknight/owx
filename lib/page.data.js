import obj from './object'

const $init = page => {
  page.$data = obj.$copy(page.data, true)
}

const $digest = page => {
  const _data = page.data
  const $data = page.$data
  const ready2set = {}

  for (let k in _data) {
    const _v = _data[k]
    const $v = $data[k]

    if (!obj.$isEqual(_v, $v)) {
      ready2set[k] = _v
      $data[k] = obj.$copy(_v, true)
    }
  }

  if (Object.keys(ready2set).length > 0) {
    page.setData(ready2set)
  }
}

module.exports = { $init, $digest }