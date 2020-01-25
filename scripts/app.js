const api = "https://3g.dxy.cn/newh5/view/pneumonia";
const cheerio = require("../libs/cheerio");
const helper = require("./helper");
const isTodayWidget = $objc("EnvKit").$isWidgetExtension();
const isDarkMode = $device.isDarkMode;

const primaryTextColor = (isTodayWidget && isDarkMode) ? $color("white") : $color("darkText");
const secondaryTextColor = (isTodayWidget && isDarkMode) ? $color("gray") : $color("text");

let resultView = null;
let timelineView = null;
let rumourView = null;

exports.init = () => {

  $ui.render({
    props: {
      titleView: {
        type: "tab",
        props: {
          bgcolor: $rgb(240, 240, 240),
          items: ["疫情", "播报", "辟谣"]
        },
        events: {
          changed: sender => {
            resultView.hidden = sender.index !== 0;
            timelineView.hidden = sender.index !== 1;
            rumourView.hidden = sender.index !== 2;
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
        },
        {
          symbol: "lightbulb",
          handler: () => {
            const tips = require("./tips");
            tips.open();
          }
        }
      ]
    },
    views: [
      {
        type: "list",
        props: {
          id: "result-view",
          rowHeight: isTodayWidget ? 32 : 44,
          separatorColor: isTodayWidget ? $rgba(100, 100, 100, 0.25) : $color("separator"),
          header: {
            type: "view",
            props: {
              height: isTodayWidget ? 54 : 304
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
                    bgcolor: $color("#f3f3f3"),
                    src: $cache.get("map-image-data"),
                    contentMode: $contentMode.scaleAspectFit
                  },
                  layout: (make, view) => {
                    make.left.right.equalTo(0);
                    make.top.equalTo(20);
                    make.height.equalTo(240);
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
                      type: "web",
                      props: {
                        url: api,
                        hidden: true
                      },
                      layout: $layout.fill,
                      events: {
                        didFinish: sender => {
                          const timer = setInterval(async() => {
                            const script = `(() => {
                              const canvas = document.querySelector("canvas");
                              if (canvas) {
                                return canvas.toDataURL("image/png");
                              } else {
                                return null;
                              }
                            })();`;
                            const dataURL = (await sender.eval(script))[0];
                            if (dataURL) {
                              timer.invalidate();
                              sender.remove();
                              $("map-image-view").src = dataURL;
                              $cache.set("map-image-data", dataURL);
                            }
                          }, 200);
                        }
                      }
                    },
                    {
                      type: "button",
                      props: {
                        symbol: "arrow.up.left.and.arrow.down.right",
                        bgcolor: $color("clear")
                      },
                      layout: (make, view) => {
                        make.left.top.equalTo(5);
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
                  lines: 2
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
                make.left.inset(15);
                make.right.inset(isTodayWidget ? 15 : 40);
                make.centerY.equalTo(view.super);
              }
            },
            {
              type: "image",
              props: {
                symbol: "chevron.right",
                tintColor: $color("#dddddd"),
                hidden: isTodayWidget
              },
              layout: (make, view) => {
                make.right.inset(15);
                make.centerY.equalTo(view.super);
              }
            }
          ]
        },
        layout: $layout.fill,
        events: {
          didSelect: (sender, indexPath, data) => {
            if (isTodayWidget) {
              const name = encodeURIComponent($addin.current.name);
              const url = `jsbox://run?name=${name}`;
              $app.openURL(url);
            } else {
              $ui.push({
                props: {
                  title: data.province
                },
                views: [
                  {
                    type: "list",
                    props: {
                      data: data.cities.map(x => `${x.cityName} ${helper.format(x)}`)
                    },
                    layout: $layout.fill
                  }
                ]
              });
            }
          },
          pulled: refresh
        }
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
            openURL(data.link);
          },
          pulled: refresh
        }
      },
      {
        type: "web",
        props: {
          id: "rumour-view",
          hidden: true
        },
        layout: $layout.fill,
        events: {
          didFinish: async(sender) => {
            const script =
            `
            document.querySelector(".homepage_top").remove();
            document.querySelector(".content_title").remove();
            document.querySelector(".bottom").remove();
            `;
            await sender.eval(script);
            sender.alpha = 1;
          },
          decideNavigation: (sender, navigation) => {
            const url = navigation.requestURL;
            if (url === sender.url) {
              return true;
            } else {
              openURL(url);
              return false;
            }
          }
        }
      }
    ]
  });

  resultView = $("result-view");
  timelineView = $("timeline-view");
  rumourView = $("rumour-view");
  refresh();
}

async function refresh() {
  const {data} = await $http.get(api);
  const doc = cheerio.load(data);

  const getAreaStat = doc("#getAreaStat").html();
  eval(getAreaStat);

  const getTimelineService = doc("#getTimelineService").html();
  eval(getTimelineService);

  const mapTitle = doc("p[class^='mapTitle']").text();
  $("ts-label").text = mapTitle;

  const confirmedNumber = doc("p[class^='confirmedNumber']").text();
  $("confirmed-label").text = confirmedNumber;

  resultView.data = window.getAreaStat.map(x => {
    return {
      "result-label": {
        "text": helper.format(x)
      },
      "province": x.provinceShortName,
      "cities": x.cities
    }
  });

  if (!isTodayWidget) {
    timelineView.data = window.getTimelineService.map(x => {
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
  rumourView.alpha = 0;
  rumourView.url = "https://vp.fact.qq.com/home";
}

function openURL(url) {
  $safari.open({
    url: url
  });
}