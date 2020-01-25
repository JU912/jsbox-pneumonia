const constants = require("./constants");

const {
  isTodayWidget,
  primaryTextColor,
  secondaryTextColor,
} = constants;

exports.resultView = (() => {
  return [
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
  ];
})();

exports.timelineView = (() => {
  return [
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
  ];
})();