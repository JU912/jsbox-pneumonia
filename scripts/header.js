const constants = require("./constants");
const helper = require("./helper");

const {
  api,
  isTodayWidget,
  secondaryTextColor,
} = constants;

let mapImageView = null;
let chartImageView1 = null;
let chartImageView2 = null;
let chartImageView3 = null;
let chartImageView4 = null;
let chartImageView5 = null;
let chartImageView6 = null;

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

  const imageCache = $cache.get("chart-image-urls") || [];
  const createImageView = (index, ready) => {
    return {
      type: "image",
      props: {
        src: imageCache[index],
        contentMode: $contentMode.scaleAspectFit
      },
      events: {
        ready: ready,
        tapped: helper.openImage
      }
    }
  }

  views.push({
    type: "view",
    layout: (make, view) => {
      make.left.right.equalTo(0);
      make.top.equalTo(20);
      make.height.equalTo(240);
    },
    views: [
      {
        type: "gallery",
        props: {
          onColor: $color("#157efb"),
          offColor: $color("#cccccc"),
          items: [
            {
              type: "image",
              props: {
                src: $cache.get("map-image-url"),
                contentMode: $contentMode.scaleAspectFit
              },
              events: {
                ready: sender => {
                  mapImageView = sender;
                },
                tapped: helper.openImage
              }
            },
            createImageView(0, sender => chartImageView1 = sender),
            createImageView(1, sender => chartImageView2 = sender),
            createImageView(2, sender => chartImageView3 = sender),
            createImageView(3, sender => chartImageView4 = sender),
            createImageView(4, sender => chartImageView5 = sender),
            createImageView(5, sender => chartImageView6 = sender),
          ]
        },
        layout: $layout.fill
      },
      {
        type: "web",
        props: {
          id: "hidden-webview",
          url: api,
          hidden: true
        },
        layout: $layout.fill,
        events: {
          didFinish: webViewDidFinish
        }
      }
    ]
  });
}

views.push({
  type: "label",
  props: {
    id: "summary-label",
    textColor: secondaryTextColor,
    font: $font(13),
    align: $align.center
  },
  layout: (make, view) => {
    make.left.right.inset(15);
    make.bottom.equalTo(0);
    make.height.equalTo(20);
  }
});

exports.view = (() => {
  return {
    type: "view",
    props: {
      height: isTodayWidget ? 36 : 280
    },
    views: views
  };
})();

function webViewDidFinish(sender) {
  const timer = setInterval(async() => {
    const script =
    `
    (() => {
      const mapImage = document.querySelector("div[class^='mapImg'] > img");
      const canvas = document.querySelector("canvas");
      const chartImages = document.querySelectorAll("img[class^='mapImg']");
      const statistics = document.querySelector("div[class^='statistics'] > div[class^='title'] > span");
      if ((mapImage || canvas) && chartImages && statistics) {
        return {
          mapDataURL: mapImage ? mapImage.src : canvas.toDataURL("image/png"),
          chartDataURLs: [...chartImages].map(x => x.src),
          statsText: statistics.innerText,
        };
      } else {
        return null;
      }
    })();
    `;
    const results = (await sender.eval(script))[0];
    if (results) {
      timer.invalidate();
      mapImageView.src = results.mapDataURL;
      chartImageViews().forEach((view, index) => {
        view.src = results.chartDataURLs[index];
      });
      $("ts-label").text = results.statsText;
      $cache.set("map-image-url", results.mapDataURL);
      $cache.set("chart-image-urls", results.chartDataURLs);
    }
  }, 200);
}

function chartImageViews() {
  return [
    chartImageView1,
    chartImageView2,
    chartImageView3,
    chartImageView4,
    chartImageView5,
    chartImageView6,
  ];
}