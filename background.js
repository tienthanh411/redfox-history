
const REDFOX_PREFIX = "https://redfoxsanakirja.fi/fi/sanakirja/-/s/fin/eng/";
const STORAGE_KEY = 'word_list';
const TIME_GAP = 60*1000; // 60 seconds

// function current_date() {
//     return new Date().toJSON().slice(0, 10);
// }

chrome.tabs.onUpdated.addListener(function (_, change_info, tab) {
    if (change_info.status != "complete" || !tab.url.startsWith(REDFOX_PREFIX)) {
        return;
    }

    var word = tab.url.split('/').pop();
    var current_time = Date.now();
    console.log("Checking: " + word + " - " + current_time);

    chrome.storage.local.get(STORAGE_KEY, function(data) {
        var item_list = [];
        if (data[STORAGE_KEY] !== undefined) {
            item_list = data[STORAGE_KEY];
        }

        var item = null;
        for (var i = 0; i < item_list.length; i++) {
            if (item_list[i]['word'] == word) {
                item = item_list[i];
                break;
            }
        }
        if (item === null) {
            item = {};
            item['word'] = word;
            item['count'] = 0;
            item['latest'] = 0;
            item_list.push(item);
        }
        if (current_time-item['latest'] > TIME_GAP) {
            item['count'] += 1;
        }
        item['latest'] = current_time;

        // Store the new list
        var set_data = {};
        set_data[STORAGE_KEY] = item_list;
        console.log(item_list);
        chrome.storage.local.set(set_data, function() {});
    });
    
});