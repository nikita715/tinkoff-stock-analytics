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

document.addEventListener('DOMContentLoaded', function() {

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

  chrome.storage.sync.get(['advice_link_templates'], function(items) {
    document.getElementById("advice_link_templates").value = items['advice_link_templates'];
  });

  document.getElementById("save_advice_link_templates").addEventListener('click', function(e) {
    chrome.storage.sync.set({
      "advice_link_templates": document.getElementById("advice_link_templates").value
    });
  });

  document.getElementById("reset_advice_link_templates").addEventListener('click', function(e) {
    let defaultLinksJson = JSON.stringify(defaultAdviceLinks);
    chrome.storage.sync.set({
      "advice_link_templates": defaultLinksJson
    });
    document.getElementById("advice_link_templates").value = defaultLinksJson;
  });

});
