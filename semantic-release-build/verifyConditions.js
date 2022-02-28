const SemanticReleaseError = require('@semantic-release/error')

const verifyConditions = () => {
  const { PRIVATE_KEY, PRIVATE_KEY_PATH } = process.env

  if (!PRIVATE_KEY && !PRIVATE_KEY_PATH) {
    throw new SemanticReleaseError('请设置 PRIVATE_KEY 或 PRIVATE_KEY_PATH')
  }
}

module.exports = verifyConditions
