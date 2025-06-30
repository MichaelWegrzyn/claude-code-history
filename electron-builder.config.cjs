module.exports = {
  appId: 'com.claudecode.historyviewer',
  productName: 'Claude Code History Viewer',
  directories: {
    output: 'release',
  },
  files: [
    'dist/**/*',
    'package.json',
  ],
  mac: {
    category: 'public.app-category.developer-tools',
    icon: 'build/icon.icns',
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist',
  },
  dmg: {
    contents: [
      {
        x: 410,
        y: 150,
        type: 'link',
        path: '/Applications',
      },
      {
        x: 130,
        y: 150,
        type: 'file',
      },
    ],
  },
  win: {
    target: 'nsis',
    icon: 'build/icon.ico',
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    deleteAppDataOnUninstall: true,
  },
  linux: {
    target: ['AppImage', 'snap', 'deb'],
    category: 'Development',
    icon: 'build/icon.png',
  },
};