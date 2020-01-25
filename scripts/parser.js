const cheerio = require("../libs/cheerio");
const helper = require("./helper");

exports.parse = data => {
  window = window || {};
  const doc = cheerio.load(data);

  const getAreaStat = doc("#getAreaStat").html();
  eval(getAreaStat);

  const getTimelineService = doc("#getTimelineService").html();
  eval(getTimelineService);

  const mapTitle = doc("p[class^='mapTitle']").text();
  const mapImg = doc("img[class^='mapImg']").attr("src");
  const confirmedNumber = doc("p[class^='confirmedNumber']").text();

  const resultViewData = window.getAreaStat.map(x => {
    return {
      "result-label": {
        "text": helper.format(x)
      },
      "province": x.provinceShortName,
      "cities": x.cities
    }
  });

  const timelineViewData = window.getTimelineService.map(x => {
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

  return {
    mapTitle,
    mapImg,
    confirmedNumber,
    resultViewData,
    timelineViewData,
  }
}