const helper = require("./helper");

exports.open = data => {
  $ui.push({
    props: {
      title: data.province
    },
    views: [
      {
        type: "list",
        props: {
          data: data.cities.map(x => {
            return `${x.cityName} ${helper.format(x)}`
          })
        },
        layout: $layout.fill
      }
    ]
  });
}