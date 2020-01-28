const cheerio = require("../libs/cheerio");
const helper = require("./helper");

exports.parse = data => {
  window = window || {};
  const doc = cheerio.load(data);

  const getAreaStat = doc("#getAreaStat").html();
  eval(getAreaStat);

  const getListByCountryTypeService2 = doc("#getListByCountryTypeService2").html();
  eval(getListByCountryTypeService2);

  const getTimelineService = doc("#getTimelineService").html();
  eval(getTimelineService);

  const mapTitle = doc("div[class^='statistics']").children("div[class^='title']").children("span").text();
  const mapImg = doc("img[class^='mapImg']").attr("src");
  const confirmedNumber = doc("p[class^='confirmedNumber']").text();

  const resultViewData = [
    {
      "title": "国内疫情",
      "rows": window.getAreaStat.map(x => {
        return {
          "result-label": {
            "text": helper.format(x)
          },
          "province": x.provinceShortName,
          "cities": x.cities
        }
      })
    },
    {
      "title": "全球疫情",
      "rows": window.getListByCountryTypeService2.map(x => {
        return {
          "result-label": {
            "text": helper.format(x)
          },
          "province": x.provinceName,
          "cities": []
        }
      })
    }
  ];

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