const cheerio = require("../libs/cheerio");
const isTodayWidget = $objc("EnvKit").$isWidgetExtension();
const isDarkMode = $device.isDarkMode;

const primaryTextColor = (isTodayWidget && isDarkMode) ? $color("white") : $color("darkText");
const secondaryTextColor = (isTodayWidget && isDarkMode) ? $color("gray") : $color("text");

let mapView = null;
let resultView = null;
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
          handler: async() => {
            $device.taptic(1);
            await refresh();
            $ui.toast("刷新成功");
          }
        }
      ]
    },
    views: [
      {
        type: "view",
        props: {
          id: "map-view"
        },
        layout: $layout.fill,
        views: [
          {
            type: "list",
            props: {
              id: "result-view",
              rowHeight: isTodayWidget ? 32 : 44,
              separatorColor: isTodayWidget ? $rgba(100, 100, 100, 0.25) : $color("separator"),
              selectable: isTodayWidget,
              header: {
                type: "view",
                props: {
                  height: isTodayWidget ? 54 : 264
                },
                views: (() => {
                  const views = [
                    {
                      type: "label",
                      props: {
                        id: "ts-label",
                        textColor: secondaryTextColor,
                        font: $font(13),
                        align: $align.center
                      },
                      layout: (make, view) => {
                        make.centerX.equalTo(view.super);
                        make.top.equalTo(0);
                        make.height.equalTo(20);
                      }
                    }
                  ];
                  if (!isTodayWidget) {
                    views.push({
                      type: "image",
                      props: {
                        id: "map-image-view",
                        contentMode: $contentMode.scaleAspectFit
                      },
                      layout: (make, view) => {
                        make.left.right.equalTo(0);
                        make.top.equalTo(20);
                        make.height.equalTo(200);
                      },
                      events: {
                        tapped: sender => {
                          $device.taptic(1);
                          $quicklook.open({
                            image: sender.image
                          });
                        }
                      },
                      views: [
                        {
                          type: "button",
                          props: {
                            symbol: "arrow.up.left.and.arrow.down.right",
                            bgcolor: $color("clear")
                          },
                          layout: (make, view) => {
                            make.top.equalTo(5);
                            make.left.equalTo(15);
                          },
                          events: {
                            tapped: () => {
                              $device.taptic(1);
                              $quicklook.open({
                                image: $("map-image-view").image
                              });
                            }
                          }
                        }
                      ]
                    });
                  }
                  views.push({
                    type: "label",
                    props: {
                      id: "confirmed-label",
                      textColor: secondaryTextColor,
                      font: $font(13),
                      align: $align.center,
                      autoFontSize: true
                    },
                    layout: (make, view) => {
                      make.left.right.inset(15);
                      make.bottom.equalTo(0);
                      make.height.equalTo(44);
                    }
                  });
                  return views;
                })()
              },
              template: [
                {
                  type: "label",
                  props: {
                    id: "result-label",
                    font: $font(isTodayWidget ? 13 : 17),
                    textColor: primaryTextColor,
                    lines: 2
                  },
                  layout: (make, view) => {
                    make.left.right.inset(15);
                    make.centerY.equalTo(view.super);
                  }
                }
              ]
            },
            layout: $layout.fill,
            events: {
              tapped: () => {
                if (isTodayWidget) {
                  const name = encodeURIComponent($addin.current.name);
                  const url = `jsbox://run?name=${name}`;
                  $app.openURL(url);
                }
              },
              pulled: refresh
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
        layout: $layout.fill,
        events: {
          didSelect: (sender, indexPath, data) => {
            const link = data.link;
            $safari.open({
              url: link
            });
          },
          pulled: refresh
        }
      }
    ]
  });

  mapView = $("map-view");
  resultView = $("result-view");
  timelineView = $("timeline-view");
  refresh();
}

async function refresh() {
  const api = "https://3g.dxy.cn/newh5/view/pneumonia";
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
  resultView.data = listByCountryTypeService1.sort((lhs, rhs) => {
    return lhs.sort - rhs.sort;
  }).map(x => {
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
  }

  resultView.endRefreshing();
  timelineView.endRefreshing();
}