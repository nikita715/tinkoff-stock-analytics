/*
   Copyright 2021 Nikita Stepochkin

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

let adviceBody = ['<div class="form-row flex-nowrap tinkoff-advice-element">',
  '  <div class="form-group col-2">',
  '    <label class="sr-only" for="inlineFormInput">Name</label>',
  '    <input type="text" class="form-control" placeholder="Tag">',
  '  </div> ',
  '  <div class="form-group col">',
  '    <label class="sr-only" for="inlineFormInput">Name</label>',
  '    <input type="text" class="form-control" placeholder="URL"> ',
  '  </div>',
  '</div>'
] .join('')

let defaultAdviceLinks = {
    "yah": "https://finance.yahoo.com/quote/$tag/",
    "foo": "https://www.fool.com/quote/$tag",
    "cnn": "https://money.cnn.com/quote/quote.html?symb=$tag",
    "tip": "https://www.tipranks.com/stocks/$tag/stock-analysis",
    "bar": "https://www.barrons.com/quote/stock/$tag",
    "inv": "https://research.investors.com/quote.aspx?symbol=$tag",
    "maw": "https://www.marketwatch.com/investing/stock/$tag",
    "bui": "https://markets.businessinsider.com/stocks/$tag-stock",
};

document.addEventListener('DOMContentLoaded', function() {

  createLinkContainers();

  document.getElementById("save_advice_link_templates").addEventListener('click', function(e) {
    chrome.storage.sync.set({
      "advice_link_templates": JSON.stringify(parseLinksOnPage())
    });
    alert("Saved!");
  });

  document.getElementById("copy_advice_link_templates").addEventListener('click', function(e) {
    navigator.clipboard.writeText(JSON.stringify(parseLinksOnPage())).then(function() {
      alert('Copied to clipboard!');
    });
  });

  document.getElementById("reset_advice_link_templates").addEventListener('click', function(e) {
    let defaultLinksJson = JSON.stringify(defaultAdviceLinks);
    chrome.storage.sync.set({
      "advice_link_templates": defaultLinksJson
    });
    removeAllLinkContainers();
    createLinkContainers();
  });

  document.getElementById("add_advice_link_template").addEventListener('click', function(e) {
    document.querySelectorAll('div[class^="advice_container"]')[0]
      .appendChild(createLinkContainer("", ""));
  });

  document.getElementById("paste_advice_link_templates").addEventListener('click', function(e) {
    chrome.storage.sync.get(['advice_link_templates'], function(items) {
      var previousAdviceLinks = getCurrentAdviceLinks(items);
      try {
        chrome.storage.sync.set({
          "advice_link_templates": document.getElementById("inputJson").value
        });
        removeAllLinkContainers();
        createLinkContainers();
        alert("Saved!");
      } catch (e) {
        alert("Wrong format!");
        chrome.storage.sync.set({
          "advice_link_templates": previousAdviceLinks
        });
        removeAllLinkContainers();
        createLinkContainers();
      }
    });
  });
});

let adviceContainer = document.querySelectorAll('div[class^="advice_container"]')[0];
let itemContent = document.querySelectorAll('template[class^="advice_template"]')[0].innerHTML;

function createLinkContainers() {
  chrome.storage.sync.get(['advice_link_templates'], function(items) {
    var adviceLinks = getCurrentAdviceLinks(items);
    Object.keys(adviceLinks).filter((name) => name !== "").forEach((name) => {
        adviceContainer.appendChild(createLinkContainer(name, adviceLinks[name]));
    });
  });
}

function getCurrentAdviceLinks(storage) {
  var adviceLinks;
  try {
    adviceLinks = JSON.parse(storage['advice_link_templates']);
  } catch(e) {
    console.log(e);
    adviceLinks = defaultAdviceLinks;
  }
  return adviceLinks;
}

function createLinkContainer(tag, url) {
    var itemElement = document.createElement('div');
    itemElement.innerHTML = itemContent;
    let inputs = itemElement.querySelectorAll('input[class^="form-control"]');
    inputs[0].value = tag;
    inputs[1].value = url;
    let deleteButton = itemElement.querySelectorAll('a[class*="delete_advice_link"]')[0];
    addDeleteButtonListener(deleteButton);
    return itemElement;
}

function parseLinksOnPage() {
  return Array.from(document.querySelectorAll('div[class*="tinkoff-advice-element"]')).map((itemElement) => {
    let inputs = itemElement.querySelectorAll('input[class^="form-control"]');
    return {key: inputs[0].value, val: inputs[1].value};
  }).reduce(function(map, obj) {
      map[obj.key] = obj.val;
      return map;
  }, {});
}

function removeAllLinkContainers() {
  Array.from(document.querySelectorAll('div[class*="tinkoff-advice-element"]')).forEach((item) => {
    item.parentElement.parentElement.removeChild(item.parentElement);
  });
}

function addDeleteButtonListener(deleteButton) {
  deleteButton.addEventListener("click", function(e) {
    this.parentElement.parentElement.parentElement.removeChild(this.parentElement.parentElement);
  });
}
