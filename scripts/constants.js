const api = "https://3g.dxy.cn/newh5/view/pneumonia";
const rumourURL = "https://vp.fact.qq.com/home";
const isTodayWidget = $objc("EnvKit").$isWidgetExtension();
const isDarkMode = isTodayWidget && $device.isDarkMode;
const primaryTextColor = isDarkMode ? $color("white") : $color("darkText");
const secondaryTextColor = isDarkMode ? $color("gray") : $color("text");
const separatorColor = isTodayWidget ? $rgba(100, 100, 100, 0.25) : $color("separator");

module.exports = {
  api,
  rumourURL,
  isTodayWidget,
  primaryTextColor,
  secondaryTextColor,
  separatorColor,
}