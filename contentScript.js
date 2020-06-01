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
    .Table__cell_3dA6T {
        position: relative
    }
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
    }
</style>`);

let adviceLinks = {
    "yah": "https://finance.yahoo.com/quote/$tag/",
    "bar": "https://www.barrons.com/quote/stock/$tag",
    "inv": "https://research.investors.com/quote.aspx?symbol=$tag",
    "tip": "https://www.tipranks.com/stocks/$tag/stock-analysis",
    "cnn": "https://money.cnn.com/quote/quote.html?symb=$tag",
    "maw": "https://www.marketwatch.com/investing/stock/$tag",
    "bui": "https://markets.businessinsider.com/stocks/$tag-stock",
};

let addStockAdvice = (e) => {
    if (!e.hasAttribute("hasStockAdvice")) {
        let stockTag = e.getElementsByClassName("Caption__subcaption_39Lm3")[0].textContent;
        
        let isPersonalPage = window.location.href.indexOf('https://www.tinkoff.ru/invest/broker_account/') === 0;
        
        let stockName = isPersonalPage
            ? e.getElementsByClassName("PortfolioTablePure__subcaptionTicker_dE3m0")[0]
            : e.getElementsByClassName("SecurityColumn__nameWrapper_3gZum")[0];

        let eChild = e.getElementsByClassName("Table__cell_3dA6T")[isPersonalPage ? 3 : 2];

        e.addEventListener("mouseenter", function(event) {
            let container = document.createElement("div");
            container.setAttribute("class", "stock-analytics-container");
            eChild.appendChild(container);
            
            let taggedAdviceLinks = createMapOfTaggedLinks(stockTag);
            
            addLinkToAdvice(container, taggedAdviceLinks);
            addLinkToAllAdvices(container, taggedAdviceLinks);
        });

        e.addEventListener("mouseleave", function(event) {
            let container = eChild.getElementsByClassName("stock-analytics-container")[0];
            if (container !== undefined) {
                container.parentNode.removeChild(container);
            }
        });

        e.setAttribute("hasStockAdvice", "");
    }
};

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

Array.from(document.getElementsByClassName("Table__row_clickable_2VMNN"))
    .forEach(addStockAdvice);