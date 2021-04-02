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
        display: flex;
        left: 0;
        top: 0;
        height: 100%;
        margin-left: 100%;
        padding: 22px;
    }
    .stock-analytics-link {
        width: 20px;
        height: 20px;
        background-color: aquamarine;
        margin: 5px 0 5px 5px;
    }
    .stock-analytics-container-in {
        height: 20px;
        margin: 5px 0 5px 5px;
        z-index: 10000;
    }
    .stock-analytics-container-in:last-child {
        margin-right: 5px;
        cursor: pointer;
    }
    .stock-analytics-container-in:first-of-type {
        margin-left: 0px;
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
        let stockTag = e.querySelectorAll('div[class^="Caption__subcaption"]')[0].textContent;

        let isPersonalPage = window.location.href.indexOf('https://www.tinkoff.ru/invest/broker_account/') === 0;

        let lastElementOfRow = e.querySelectorAll('td[class^="Table__cell"]')[isPersonalPage ? 3 : 2];
        lastElementOfRow.style.position = "relative";

        e.addEventListener("mouseenter", function(event) {
            let container = document.createElement("div");
            container.setAttribute("class", "stock-analytics-container");
            lastElementOfRow.appendChild(container);

            let taggedAdviceLinks = createMapOfTaggedLinks(stockTag);

            addLinkToAdvice(container, taggedAdviceLinks);
            addLinkToAllAdvices(container, taggedAdviceLinks);
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
    if (document.querySelectorAll('span[class^="FavoritesLabelPure__label_"]').length === 0) {
        window.setTimeout(addStockAdviceForStock, 1000);
    } else {
        let stockTag = document.querySelectorAll('span[class^="SecurityHeaderPure__ticker_"]')[0].textContent;

        let taggedAdviceLinks = createMapOfTaggedLinks(stockTag);

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

        addLinkToAdvice(container, taggedAdviceLinks);
        addLinkToAllAdvices(container, taggedAdviceLinks);
        
        document.querySelectorAll('span[class^="SecurityHeaderPure__ticker_"]')[0].setAttribute("hasStockAdvice", "");
    }
}

function createMapOfTaggedLinks(stockTag) {
    return Object.keys(adviceLinks).map((name) => {
        let taggedLink = adviceLinks[name].replace("$tag", stockTag);
        return {key: name, val: taggedLink};
    }).reduce(function(map, obj) {
        map[obj.key] = obj.val;
        return map;
    }, {});;
}

function addLinkToAdvice(container, taggedAdviceLinks) {
    Object.keys(taggedAdviceLinks).forEach((name) => {
        let taggedLink = taggedAdviceLinks[name];
        let linkElement = document.createElement("a");
        linkElement.setAttribute("class", "stock-analytics-container-in");
        linkElement.setAttribute("href", taggedLink);
        linkElement.setAttribute("target", "_blank");
        linkElement.innerHTML = name;
        container.appendChild(linkElement);
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

let stockPageUrlRegexp = new RegExp('https://www\.tinkoff\.ru/invest/stocks/.+/.*');
let stockListPageUrlRegexp = new RegExp('https://www\.tinkoff\.ru/invest/(favorites|broker_account|stocks)/.*');

function addStockAdviceInWindow() {
    if (stockPageUrlRegexp.test(window.location.href)) {
        let tickets = document.querySelectorAll('span[class^="SecurityHeaderPure__ticker_"]');
        if (tickets.length === 0 || !tickets[0].hasAttribute("hasStockAdvice")) {
            addStockAdviceForStock();
        }
    } else if (stockListPageUrlRegexp.test(window.location.href)) {
        let ticketCount = Number(new URLSearchParams(window.location.href).get('end'));
        let tickets = document.querySelectorAll('tr[class*="Table__row_clickable"]');
        if (tickets.length == 0 || ticketCount != 0 && ticketCount != tickets.length) {
            window.setTimeout(addStockAdviceInWindow, 200);
        } else {
            Array.from(tickets).forEach(addStockAdvice);
        }
    }
}

chrome.storage.sync.get(['foo', 'bar'], function(items) {
  console.log('Settings retrieved', items);
});

addStockAdviceInWindow();
