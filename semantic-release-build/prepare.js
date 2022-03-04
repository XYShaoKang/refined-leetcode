const path = require('path')
const fs = require('fs')
const SemanticReleaseError = require('@semantic-release/error')
const archiver = require('archiver')
const ChromeExtension = require('crx')

const getKey = () => {
  let { PRIVATE_KEY, PRIVATE_KEY_PATH } = process.env
  if (PRIVATE_KEY) return Buffer.from(PRIVATE_KEY, 'utf-8')

  try {
    const keyPath = PRIVATE_KEY_PATH || path.resolve('key.pem')
    fs.accessSync(keyPath, fs.constants.W_OK)
    return fs.readFileSync(keyPath)
  } catch (error) {
    throw new SemanticReleaseError('请设置 PRIVATE_KEY 或 PRIVATE_KEY_PATH')
  }
}

const prepare = (pluginConfig = {}, context) => {
  let { dist = 'dist', name = 'extension' } = pluginConfig

  dist = path.resolve(dist)
  if (!fs.existsSync(dist)) throw new SemanticReleaseError('dist 目录不存在')

  const manifestPath = path.join(dist, 'manifest.json')
  if (!fs.existsSync(manifestPath))
    throw new SemanticReleaseError('manifest.json 文件不存在')

  const { logger, nextRelease } = context

  // 修改版本号
  const version = nextRelease.version
  try {
    logger.log('修改 manifest.json 版本号')
    const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({ ...manifestData, version }, null, 2),
      'utf-8'
    )

    logger.log('修改 package.json 版本号')
    const packagePath = path.resolve('package.json')
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf-8'))
    fs.writeFileSync(
      packagePath,
      JSON.stringify({ ...packageData, version }, null, 2),
      'utf-8'
    )
  } catch (error) {
    throw new SemanticReleaseError('修改版本失败')
  }

  // 打包成 zip
  logger.log('打包 zip')
  const archive = archiver('zip', { zlib: { level: 9 } })
  const output = path.resolve(`${name}.zip`)
  archive.pipe(fs.createWriteStream(output))
  archive.directory(dist, false)
  archive.finalize()

  // 打包为 crx
  logger.log('打包 crx')
  new ChromeExtension({ privateKey: getKey() })
    .load(dist)
    .then(crx => crx.pack())
    .then(crxBuffer => {
      fs.mkdir
      fs.writeFileSync(path.resolve(`${name}.crx`), crxBuffer)
    })
}

module.exports = prepare
