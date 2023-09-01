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

document.head.insertAdjacentHTML("beforeend",
`<style>
    .stock-analytics-container {
        position: absolute;
        left: 0;
        top: -1px;
        margin-left: 100%;
        overflow: hidden;
        opacity: .3;
    }
    .stock-analytics-container:hover {
        opacity: 1;
    }
    .stock-analytics-container-wrapper {
        margin-left: 20px;
        margin-right: 20px;
        padding: 30px 40px 30px 20px;
        text-align: initial;
        font-size: 15px;
        border: 1px solid #f2f2f2;
        border-radius: 6px;
        overflow: hidden;
        display: inline-block;
        float: left;
        z-index: 10000;
        background-color: white;
    }
    .stock-analytics-link {
        width: 20px;
        height: 20px;
        background-color: aquamarine;
        margin: 5px 0 5px 50px;
        width: 100%;
    }
    .stock-analytics-container-in {
        height: 20px;
        margin: 5px 0 5px;
        z-index: 10000;
        width: 100%;
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
        line-height: 25px;
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
    .stock-analytics-container-in__page {
        margin-right: 5px;
        display: inline-block;
        width: auto;
        height: auto;
        line-height: 10px;
    }
</style>`);

let adviceLinks = {
    "Yahoo": "https://finance.yahoo.com/quote/$tag/",
    "GuruFocus": "https://www.gurufocus.com/stock/$tag/summary",
    "FinViz": "https://finviz.com/screener.ashx?v=121&t=$tag",
    "Fool": "https://www.fool.com/quote/$tag",
    "CNN": "https://money.cnn.com/quote/quote.html?symb=$tag",
    "TipRanks": "https://www.tipranks.com/stocks/$tag/stock-analysis",
    "Barrons": "https://www.barrons.com/quote/stock/$tag",
    "IBD": "https://research.investors.com/quote.aspx?symbol=$tag",
    "MarketWatch": "https://www.marketwatch.com/investing/stock/$tag",
    "BusinessInsider": "https://markets.businessinsider.com/stocks/$tag-stock",
};

let addStockAdvice = (e) => {
    if (!e.hasAttribute("hasStockAdvice") && e.querySelectorAll('a[class*="Link-module__link"]')[0].href.includes("/stocks/")) {
        var stockTagBlock = e.querySelectorAll('div[class^="SecurityRowOld__ticker_"]')[0];
        if (stockTagBlock === undefined) {
          stockTagBlock = e.querySelectorAll('div[class^="PortfolioTable__infoItem"]')[0];
        }
        let stockTag = stockTagBlock.textContent;

        let cellElements = e.querySelectorAll('td[class^="Table-module__cell"]');
        let lastElementOfRow = cellElements[cellElements.length - 1];
        lastElementOfRow.style.position = "relative";

        let adviceWidth = (document.getElementsByTagName("header")[0].clientWidth - 1200) / 2 + 40;

        e.addEventListener("mouseenter", function(event) {
            let container = document.createElement("div");
            container.setAttribute("class", "stock-analytics-container");
            container.setAttribute("style", `width: ` + adviceWidth + `px;`)
            lastElementOfRow.appendChild(container);
            let containerWrapper = document.createElement("div");
            containerWrapper.setAttribute("class", "stock-analytics-container-wrapper");
            container.appendChild(containerWrapper);

            createMapOfTaggedLinks(stockTag, function(taggedAdviceLinks) {
              addLinkToAdvice(containerWrapper, taggedAdviceLinks, false);
              addLinkToAllAdvices(containerWrapper, taggedAdviceLinks);
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
    if (document.querySelectorAll('div[class^="SecurityPrice"]').length === 0) {
        window.setTimeout(addStockAdviceForStock, 1000);
          console.log(tickets);
    } else {
        let stockTag = document.querySelectorAll('span[class^="SecurityHeader__ticker_"]')[0].textContent;

        createMapOfTaggedLinks(stockTag, function(taggedAdviceLinks) {
          let parent = document.querySelectorAll('div[class^="StickyBlock__sidebarContent_"]')[0];
          let container = document.createElement("div");
          let container2 = document.createElement("span");
          container2.textContent = "Ссылки";
          container2.setAttribute("class", "stock-analytics-container__page__title");
          let container3 = document.createElement("br");
          container.appendChild(container2);
          container.appendChild(container3);
          container.setAttribute("class", "stock-analytics-container__page");

          if (parent.parentNode.querySelectorAll('div[class*="stock-analytics-container"]').length === 0) {
            parent.appendChild(container);

            addLinkToAdvice(container, taggedAdviceLinks, true);
            addLinkToAllAdvices(container, taggedAdviceLinks);

            document.querySelectorAll('span[class^="SecurityHeader__ticker_"]')[0].setAttribute("hasStockAdvice", "");
          }
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

function addLinkToAdvice(container, taggedAdviceLinks, stockPage) {
    Object.keys(taggedAdviceLinks).forEach((name) => {
        let taggedLink = taggedAdviceLinks[name];
        let linkElement = document.createElement("a");
        linkElement.setAttribute("class", "stock-analytics-container-in");
        linkElement.setAttribute("href", taggedLink);
        linkElement.setAttribute("target", "_blank");
        linkElement.innerHTML = name;
        container.appendChild(linkElement);
        if (stockPage) {
          linkElement.setAttribute("class", "stock-analytics-container-in stock-analytics-container-in__page");
        } else {
          container.appendChild(document.createElement("br"));
        }
    });
}

function addLinkToAllAdvices(container, taggedAdviceLinks) {
    let linkElement = document.createElement("a");
    linkElement.setAttribute("class", "stock-analytics-container-in");
    linkElement.innerHTML = "All";
    container.appendChild(linkElement);

    linkElement.addEventListener("click", function(event) {
        Object.keys(taggedAdviceLinks).forEach((name) => {
            window.open(taggedAdviceLinks[name], "_blank");
        });
    });
}

let stockPageUrlRegexp = new RegExp('https://www\.tinkoff\.ru/invest/stocks/.+/.*(?<!buy/)$');
let stockListPageUrlRegexp = new RegExp('https://www\.tinkoff\.ru/invest/(favorites|broker_account|stocks|portfolio)/.*(?<!buy/)$');

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
      if (document.getElementsByTagName("header").length === 0) {
          window.setTimeout(addStockAdviceInWindow, 200);
      }
      setUserAdviceLinksIfNull();
      if (stockPageUrlRegexp.test(window.location.href)) {
        let tickets = document.querySelectorAll('span[class^="SecurityHeader__ticker_"]');
        if (tickets.length === 0 || !tickets[0].hasAttribute("hasStockAdvice")) {
            addStockAdviceForStock();
        }
      } else if (stockListPageUrlRegexp.test(window.location.href)) {
        let ticketCount = Number(new URLSearchParams(window.location.href).get('end'));
        let tickets = document.querySelectorAll('tr[class*="Table-module__row_clickable"]');
        if (tickets.length == 0 || ticketCount != 0 && ticketCount != tickets.length) {
            window.setTimeout(addStockAdviceInWindow, 200);
        } else {
            Array.from(tickets).forEach(addStockAdvice);
        }
      }
}

addStockAdviceInWindow();
