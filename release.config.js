module.exports = {
  branches: ['extension'],
  preset: 'angular',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      './semantic-release-build',
      {
        dist: 'dist',
        name: 'leetcode-extension',
      },
    ],
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json'],
        message: 'chore(release): ${nextRelease.version} [skip ci]',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: ['leetcode-extension.crx', 'leetcode-extension.zip'],
      },
    ],
  ],
}
