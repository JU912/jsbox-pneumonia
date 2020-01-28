exports.openURL = url => {
  $device.taptic(1);
  $safari.open({
    url: url
  });
}

exports.openImage = sender => {
  $device.taptic(1);
  $quicklook.open({
    image: sender.image
  });
}

exports.format = data => {
  const components = [data.provinceShortName || data.provinceName];
  if (data.confirmedCount > 0) {
    components.push(`确诊 ${data.confirmedCount}`);
  }
  if (data.suspectedCount > 0) {
    components.push(`疑似 ${data.suspectedCount}`);
  }
  if (data.curedCount > 0) {
    components.push(`治愈 ${data.curedCount}`);
  }
  if (data.deadCount > 0) {
    components.push(`死亡 ${data.deadCount}`);
  }
  if (data.comment && data.comment.length > 0) {
    components.push(data.comment);
  }
  return components.join(" ");
}