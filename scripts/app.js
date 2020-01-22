const cheerio = require("../libs/cheerio");
const isTodayWidget = $app.env == $env.today;
const isDarkMode = $device.isDarkMode;

const primaryTextColor = (isTodayWidget && isDarkMode) ? $color("white") : $color("darkText");
const secondaryTextColor = (isTodayWidget && isDarkMode) ? $color("gray") : $color("text");

let mapView = null;
let timelineView = null;

exports.init = () => {

  $ui.render({
    props: {
      titleView: {
        type: "tab",
        props: {
          bgcolor: $rgb(240, 240, 240),
          items: ["疫情地图", "实时播报"]
        },
        events: {
          changed: sender => {
            mapView.hidden = sender.index === 1;
            timelineView.hidden = !mapView.hidden;
          }
        }
      },
      navButtons: [
        {
          symbol: "arrow.clockwise.circle",
          handler: () => {
            $device.taptic(1);
            refresh();
          }
        }
      ]
    },
    views: [
      {
        type: "view",
        props: {
          id: "header-view"
        },
        layout: (make, view) => {
          make.left.top.right.equalTo(0);
          make.height.equalTo(44);
        },
        views: [
          {
            type: "label",
            props: {
              id: "ts-label",
              font: $font(14),
              textColor: secondaryTextColor,
              align: $align.center
            },
            layout: (make, view) => {
              make.centerX.equalTo(view.super);
              make.top.equalTo(5);
            }
          },
          {
            type: "label",
            props: {
              id: "confirmed-label",
              textColor: secondaryTextColor,
              font: $font(14),
              align: $align.center,
              autoFontSize: true
            },
            layout: (make, view) => {
              make.left.right.bottom.inset(5);
            }
          }
        ]
      },
      {
        type: "view",
        props: {
          id: "map-view"
        },
        layout: (make, view) => {
          make.top.equalTo($("header-view").bottom);
          make.left.bottom.right.equalTo(0);
        },
        views: [
          {
            type: "image",
            props: {
              id: "map-image-view",
              contentMode: $contentMode.scaleAspectFit
            },
            layout: (make, view) => {
              make.top.equalTo(0);
              make.left.right.equalTo(0);
              make.height.equalTo(isTodayWidget ? 0 : 200);
            },
            events: {
              tapped: sender => {
                $device.taptic(1);
                $quicklook.open({
                  image: sender.image
                });
              }
            }
          },
          {
            type: "list",
            props: {
              id: "result-list",
              rowHeight: isTodayWidget ? 32 : 44,
              separatorColor: isTodayWidget ? $rgba(100, 100, 100, 0.25) : $color("separator"),
              template: [
                {
                  type: "label",
                  props: {
                    id: "result-label",
                    textColor: primaryTextColor,
                    autoFontSize: true
                  },
                  layout: (make, view) => {
                    make.left.right.inset(15);
                    make.centerY.equalTo(view.super);
                  }
                }
              ]
            },
            layout: (make, view) => {
              make.top.equalTo($("map-image-view").bottom);
              make.left.right.bottom.equalTo(0);
            },
            events: {
              tapped: () => {
                if (isTodayWidget) {
                  const name = encodeURIComponent($addin.current.name);
                  const url = `jsbox://run?name=${name}`;
                  $app.openURL(url);
                }
              }
            }
          }
        ]
      },
      {
        type: "list",
        props: {
          id: "timeline-view",
          rowHeight: 80,
          template: [
            {
              type: "label",
              props: {
                id: "title-label",
                textColor: primaryTextColor,
                font: $font("bold", 17),
                lineBreakMode: 4
              },
              layout: (make, view) => {
                make.left.right.top.equalTo(8);
              }
            },
            {
              type: "label",
              props: {
                id: "summary-label",
                textColor: secondaryTextColor,
                font: $font(15),
                lines: 2,
                lineBreakMode: 4
              },
              layout: (make, view) => {
                make.left.right.bottom.inset(8);
              }
            }
          ],
          hidden: true
        },
        layout: (make, view) => {
          make.top.equalTo($("header-view").bottom);
          make.left.bottom.right.equalTo(0);
        },
        events: {
          didSelect: (sender, indexPath, data) => {
            const link = data.link;
            $safari.open({
              url: link
            });
          }
        }
      }
    ]
  });

  mapView = $("map-view");
  timelineView = $("timeline-view");
  refresh();
}

async function refresh() {
  const api = "https://3g.dxy.cn/newh5/view/pneumonia_peopleapp";
  const {data} = await $http.get(api);
  const doc = cheerio.load(data);

  const getListByCountryTypeService1 = doc("#getListByCountryTypeService1").html();
  eval(getListByCountryTypeService1);

  const getTimelineService = doc("#getTimelineService").html();
  eval(getTimelineService);

  const mapTitle = doc("p[class^='mapTitle']").text();
  $("ts-label").text = mapTitle;

  const confirmedNumber = doc("p[class^='confirmedNumber']").text();
  $("confirmed-label").text = confirmedNumber;

  const listByCountryTypeService1 = window.getListByCountryTypeService1;
  $("result-list").data = listByCountryTypeService1.map(x => {
    return {
      "result-label": {
        "text": `${x.provinceName} ${x.tags}`
      }
    }
  });

  if (!isTodayWidget) {
    const mapImg = doc("img[class^='mapImg']").attr("src");
    $("map-image-view").src = mapImg;

    const timelineService = window.getTimelineService.result;
    timelineView.data = timelineService.map(x => {
      return {
        "title-label": {
          "text": x.title
        },
        "summary-label": {
          "text": x.summary
        },
        "link": x.sourceUrl
      }
    });

    $ui.toast("更新成功");
  }
}