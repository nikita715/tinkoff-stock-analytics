/*
   Copyright 2019 Nikita Stepochkin

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

let adviceWidth = (document.getElementsByTagName("header")[0].clientWidth - 1200) / 2 - 15;

document.head.insertAdjacentHTML("beforeend",
`<style>
    .stock-analytics-container {
        position: absolute;
        left: 0;
        top: 0;
        margin-left: 100%;
        width: ` + adviceWidth + `px;
        overflow: hidden;
        padding: 22px 30px 100px;
        text-align: initial;
    }
    .stock-analytics-link {
        width: 20px;
        height: 20px;
        background-color: aquamarine;
        margin: 5px 0 5px 50px;
    }
    .stock-analytics-container-in {
        height: 20px;
        margin: 5px 0 5px 5px;
        z-index: 10000;
        white-space: nowrap;
    }
    .stock-analytics-container-in:last-child {
        margin-right: 5px;
        cursor: pointer;
        color: #2200CC;
    }
    .stock-analytics-container__page {
        margin-top: 12px;
        padding: 24px 20px 20px;
        font-size: 15px;
        border: 1px solid #e7e8ea;
        border-radius: 6px;
    }
    .stock-analytics-container__page__title {
        word-wrap: break-word;
        font-size: 15px;
        line-height: 24px;
        font-family: haas,pragmatica,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif;
        font-weight: 400;
        letter-spacing: 0;
        color: rgba(0,0,0,.54);
        margin-bottom: 7px;
    }
</style>`);

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

let addStockAdvice = (e) => {
    if (!e.hasAttribute("hasStockAdvice")) {
        var stockTagBlock = e.querySelectorAll('div[class^="Caption__subcaption"]')[0];
        if (stockTagBlock === undefined) {
          stockTagBlock = e.querySelectorAll('div[class^="PortfolioTable__infoItem"]')[0];
        }
        let stockTag = stockTagBlock.textContent;

        let isPersonalPage = window.location.href.indexOf('https://www.tinkoff.ru/invest/portfolio/') === 0;

        let lastElementOfRow = e.querySelectorAll('td[class^="Table-module__cell"]')[isPersonalPage ? 3 : 2];
        lastElementOfRow.style.position = "relative";

        e.addEventListener("mouseenter", function(event) {
            let container = document.createElement("div");
            container.setAttribute("class", "stock-analytics-container");
            lastElementOfRow.appendChild(container);

            createMapOfTaggedLinks(stockTag, function(taggedAdviceLinks) {
              addLinkToAdvice(container, taggedAdviceLinks, true);
              addLinkToAllAdvices(container, taggedAdviceLinks);
            });
        });

        e.addEventListener("mouseleave", function(event) {
            let container = lastElementOfRow.getElementsByClassName("stock-analytics-container")[0];
            if (container !== undefined) {
                container.parentNode.removeChild(container);
            }
        });

        e.setAttribute("hasStockAdvice", "");
    }
};

function addStockAdviceForStock() {
    if (document.querySelectorAll('div[class^="SecurityPriceDetails__favorites"]').length === 0) {
        window.setTimeout(addStockAdviceForStock, 1000);
    } else {
        let stockTag = document.querySelectorAll('span[class^="SecurityHeaderPure__ticker_"]')[0].textContent;

        createMapOfTaggedLinks(stockTag, function(taggedAdviceLinks) {
          let parent = document.querySelectorAll('div[class^="Column-module__column_"]')[1].children[0].children[1].children[1];
          let container = document.createElement("div");
          let container2 = document.createElement("span");
          container2.textContent = "Ссылки";
          container2.setAttribute("class", "stock-analytics-container__page__title");
          let container3 = document.createElement("br");
          container.appendChild(container2);
          container.appendChild(container3);
          container.setAttribute("class", "stock-analytics-container__page");
          parent.parentNode.insertBefore(container, parent);

          addLinkToAdvice(container, taggedAdviceLinks, false);
          addLinkToAllAdvices(container, taggedAdviceLinks);

          document.querySelectorAll('span[class^="SecurityHeaderPure__ticker_"]')[0].setAttribute("hasStockAdvice", "");
        });
    }
}

function createMapOfTaggedLinks(stockTag, callback) {
  chrome.storage.sync.get("tinkoffAnalytics_adviceLinks", function(item) {
    let userAdviceLinks = JSON.parse(item["tinkoffAnalytics_adviceLinks"]);
    let taggedLinksMap = Object.keys(userAdviceLinks).map((name) => {
        let taggedLink = userAdviceLinks[name].replace("$tag", stockTag);
        return {key: name, val: taggedLink};
    }).reduce(function(map, obj) {
        map[obj.key] = obj.val;
        return map;
    }, {});
    callback(taggedLinksMap);
  });
}

function addLinkToAdvice(container, taggedAdviceLinks, wrapped) {
    Object.keys(taggedAdviceLinks).forEach((name) => {
        let taggedLink = taggedAdviceLinks[name];
        let linkElement = document.createElement("a");
        linkElement.setAttribute("class", "stock-analytics-container-in");
        linkElement.setAttribute("href", taggedLink);
        linkElement.setAttribute("target", "_blank");
        linkElement.innerHTML = name;
        container.appendChild(linkElement);
        if (wrapped) {
          container.appendChild(document.createElement("br"));
        }
    });
}

function addLinkToAllAdvices(container, taggedAdviceLinks) {
    let linkElement = document.createElement("a");
    linkElement.setAttribute("class", "stock-analytics-container-in");
    linkElement.innerHTML = "all";
    container.appendChild(linkElement);

    linkElement.addEventListener("click", function(event) {
        Object.keys(taggedAdviceLinks).forEach((name) => {
            window.open(taggedAdviceLinks[name], "_blank");
        });
    });
}

let stockPageUrlRegexp = new RegExp('https://www\.tinkoff\.ru/invest/stocks/.+/');

function setUserAdviceLinksIfNull() {
    chrome.storage.sync.get("tinkoffAnalytics_adviceLinks", function(item) {
      let userAdviceLinks = item["tinkoffAnalytics_adviceLinks"];
      if (userAdviceLinks === undefined) {
        let userAdviceLinks = JSON.stringify(adviceLinks, null, 2);
        chrome.storage.sync.set({
          "tinkoffAnalytics_adviceLinks": userAdviceLinks
        });
      }
    });
}

function addStockAdviceInWindow() {
    setUserAdviceLinksIfNull();
    if (stockPageUrlRegexp.test(window.location.href)) {
        if (!document.querySelectorAll('span[class^="SecurityHeaderPure__ticker_"]')[0].hasAttribute("hasStockAdvice")) {
            addStockAdviceForStock();
        }
    } else {
        Array.from(document.querySelectorAll('tr[class*="Table-module__row_clickable"]'))
            .forEach(addStockAdvice);
    }
}

addStockAdviceInWindow();
