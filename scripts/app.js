const constants = require("./constants");
const header = require("./header");
const templates = require("./templates");
const helper = require("./helper");
const parser = require("./parser");

const {
  api,
  rumourURL,
  isTodayWidget,
  separatorColor,
} = constants;

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
            const index = sender.index;
            resultView.hidden = index !== 0;
            timelineView.hidden = index !== 1;
            rumourView.hidden = index !== 2;
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
          bgcolor: isTodayWidget ? $color("clear") : $color("white"),
          separatorColor: separatorColor,
          header: header.view,
          stickyHeader: !isTodayWidget,
          template: templates.resultView
        },
        layout: $layout.fill,
        events: {
          didSelect: resultViewDidSelect,
          pulled: refresh
        }
      },
      {
        type: "list",
        props: {
          id: "timeline-view",
          rowHeight: 80,
          template: templates.timelineView,
          hidden: true
        },
        layout: $layout.fill,
        events: {
          didSelect: timlineViewDidSelect,
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
          didFinish: webViewDidFinish,
          decideNavigation: webViewDecideNavigation
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
  render(data);
}

function render(data) {
  const results = parser.parse(data);
  $("ts-label").text = results.mapTitle;
  $("summary-label").text = results.summaryText;

  const resultViewData = results.resultViewData;
  resultView.data = resultViewData;

  if (resultViewData == null || resultViewData.length == 0) {
    $ui.error("刷新失败");
  }

  if (!isTodayWidget) {
    timelineView.data = results.timelineViewData;
    rumourView.alpha = 0;
    rumourView.url = rumourURL;
  }

  const webView = $("hidden-webview");
  if (webView) {
    webView.url = api;
  }

  resultView.endRefreshing();
  timelineView.endRefreshing();
}

function resultViewDidSelect(sender, indexPath, data) {
  if (isTodayWidget) {
    const name = encodeURIComponent($addin.current.name);
    const url = `jsbox://run?name=${name}`;
    $app.openURL(url);
  } else {
    const detail = require("./detail");
    detail.open(data);
  }
}

function timlineViewDidSelect(sender, indexPath, data) {
  helper.openURL(data.link);
}

async function webViewDidFinish(sender) {
  const script =
  `
  document.querySelector(".homepage_top").remove();
  document.querySelector(".content_title").remove();
  document.querySelector(".bottom").remove();
  `;
  await sender.eval(script);
  sender.alpha = 1;
}

function webViewDecideNavigation(sender, navigation) {
  const url = navigation.requestURL;
  if (url !== sender.url && !sender.hidden) {
    helper.openURL(url);
    return false;
  }
  return true;
}