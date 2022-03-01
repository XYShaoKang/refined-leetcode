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
        assets: [
          {
            path: 'leetcode-extension.crx',
            name: 'leetcode-extension-${nextRelease.gitTag}.crx',
          },
          {
            path: 'leetcode-extension.zip',
            name: 'leetcode-extension-${nextRelease.gitTag}.zip',
          },
        ],
      },
    ],
  ],
}
