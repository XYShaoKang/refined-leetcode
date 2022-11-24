module.exports = {
  branches: ['master'],
  preset: 'angular',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      './semantic-release-build',
      {
        dist: 'dist',
        name: 'refined-leetcode',
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
            path: 'refined-leetcode.crx',
            name: 'refined-leetcode-${nextRelease.gitTag}.crx',
          },
          {
            path: 'refined-leetcode.zip',
            name: 'refined-leetcode-${nextRelease.gitTag}.zip',
          },
          {
            path: 'refined-leetcode.crx.zip',
            name: 'refined-leetcode-${nextRelease.gitTag}.crx.zip',
          },
        ],
      },
    ],
  ],
}
