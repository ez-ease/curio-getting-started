const assetBase = import.meta.env.BASE_URL;

export const mobileAssets = {
  iphoneBezel: `${assetBase}assets/iphone/Bezel.png`,
  iphoneKeyboard: `${assetBase}assets/iphone/Keyboard.png`,
  androidKeyboard: `${assetBase}assets/android/Keyboard.png`,
  pixel10Bezel: `${assetBase}assets/android/Pixel10.png`,
  androidNavigationBar: `${assetBase}assets/android/navigation-bar.svg`,
  androidStatusIcons: `${assetBase}assets/status/status-icons.svg`,
  iosStatusIcons: `${assetBase}assets/status/ios-status-icons.svg`,
} as const;
