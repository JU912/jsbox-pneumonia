const cheerio = require("../libs/cheerio");
const helper = require("./helper");
const moment = require("moment");

exports.parse = data => {
  window = window || {};
  const doc = cheerio.load(data);

  const getStatisticsService = doc("#getStatisticsService").html();
  eval(getStatisticsService);

  const getAreaStat = doc("#getAreaStat").html();
  eval(getAreaStat);

  const getListByCountryTypeService2 = doc("#getListByCountryTypeService2").html();
  eval(getListByCountryTypeService2);

  const getTimelineService = doc("#getTimelineService").html();
  eval(getTimelineService);

  const summaryText = `确诊 ${window.getStatisticsService.confirmedCount} 疑似 ${window.getStatisticsService.suspectedCount} 死亡 ${window.getStatisticsService.deadCount} 治愈 ${window.getStatisticsService.curedCount}`;
  const timestamp = moment(window.getStatisticsService.modifyTime).format("YYYY-MM-DD HH:mm");
  const mapTitle = `截至 ${timestamp} 全国数据统计`;
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
    summaryText,
    mapTitle,
    mapImg,
    confirmedNumber,
    resultViewData,
    timelineViewData,
  }
}