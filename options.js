let saveElement = document.getElementById("saveAdviceLinks");
let resetElement = document.getElementById("resetAdviceLinks");
let textareaElement = document.getElementById("adviceLinksArea");

let adviceLinks = {
    "fin": "https://finviz.com/screener.ashx?v=121&t=$tag",
    "gur": "https://www.gurufocus.com/stock/$tag/summary",
    "yah": "https://finance.yahoo.com/quote/$tag/",
    "foo": "https://www.fool.com/quote/$tag",
    "cnn": "https://money.cnn.com/quote/quote.html?symb=$tag",
    "tip": "https://www.tipranks.com/stocks/$tag/stock-analysis",
    "bar": "https://www.barrons.com/quote/stock/$tag",
    "inv": "https://research.investors.com/quote.aspx?symbol=$tag",
    "maw": "https://www.marketwatch.com/investing/stock/$tag",
    "bui": "https://markets.businessinsider.com/stocks/$tag-stock",
};

chrome.storage.sync.get("tinkoffAnalytics_adviceLinks", function(item) {
  let userAdviceLinks = item["tinkoffAnalytics_adviceLinks"];
  if (userAdviceLinks === undefined) {
    textareaElement.value = JSON.stringify(adviceLinks, null, 2);
  } else {
    textareaElement.value = userAdviceLinks;
  }
});

saveElement.addEventListener("click", function(event) {
  let value = textareaElement.value;
  chrome.storage.sync.set({
    "tinkoffAnalytics_adviceLinks": value
  });
});

resetElement.addEventListener("click", function(event) {
  let value = JSON.stringify(adviceLinks, null, 2);
  chrome.storage.sync.set({
    "tinkoffAnalytics_adviceLinks": value
  });
  textareaElement.value = value;
});
