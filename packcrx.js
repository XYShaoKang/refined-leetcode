const fs = require('fs')
const path = require('path')
const ChromeExtension = require('crx')

const getKey = () => {
  let { PRIVATE_KEY, PRIVATE_KEY_PATH } = process.env
  if (PRIVATE_KEY) return Buffer.from(PRIVATE_KEY, 'utf-8')

  try {
    const keyPath = PRIVATE_KEY_PATH || path.join(__dirname, './key.pem')
    fs.accessSync(keyPath, fs.constants.W_OK)
    return fs.readFileSync(keyPath)
  } catch (error) {
    throw new Error('请设置 PRIVATE_KEY 或 PRIVATE_KEY_PATH')
  }
}

const crx = new ChromeExtension({
  privateKey: getKey(),
})

crx
  .load(path.join(__dirname, './dist/'))
  .then(crx => crx.pack())
  .then(crxBuffer => {
    fs.writeFileSync(path.join(__dirname, './leetcode-extend.crx'), crxBuffer)
  })
