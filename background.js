
const REDFOX_PREFIX = "https://redfoxsanakirja.fi/fi/sanakirja/-/s/fin/eng/";
const REDFOX_API_PREFIX = 'https://api.redfoxsanakirja.fi/redfox-api/api/basic/query/fin/eng/';
const STORAGE_KEY = 'word_list';
const TIME_GAP = 60*1000; // 60 seconds


function store_word_meaning(word, meaning) {
    get_stored_item_list(function (item_list) {
        var item = null;
        for (var i = 0; i < item_list.length; i++) {
            if (item_list[i]['word'] == word) {
                item = item_list[i];
                break;
            }
        }
        if (item === null) {
            return;
        }
        item['meaning'] = meaning;
        store_item_list(item_list);
    });
}

async function check_and_store_word_meaning(word) {
    var url = REDFOX_API_PREFIX + word;
    var response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json, text/plain, */*',
        },
    });
    if (response.status != 200) {
        return;
    }

    const response_json = await response.json(); //extract JSON from the 
    var meaning = response_json.subtitleResult.query.word2;
    var unique_meaning = [...new Set(meaning)];
    store_word_meaning(word, unique_meaning);
}

function get_stored_item_list(callback) {
    chrome.storage.local.get(STORAGE_KEY, function(data) {
        var item_list = [];
        if (data[STORAGE_KEY] !== undefined) {
            item_list = data[STORAGE_KEY];
        }
        callback(item_list);
    });
}

function store_item_list(item_list) {
    var set_data = {};
    set_data[STORAGE_KEY] = item_list;
    console.log(item_list);
    chrome.storage.local.set(set_data, function () { });
}

chrome.tabs.onUpdated.addListener(function (_, change_info, tab) {
    if (change_info.status != "complete" || !tab.url.startsWith(REDFOX_PREFIX)) {
        return;
    }

    const word = tab.url.split('/').pop();
    console.log("Checking: " + word);

    get_stored_item_list(function(item_list){
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
            item['meaning'] = [];
            item_list.push(item);
        }
        var current_time = Date.now();
        if (current_time - item['latest'] > TIME_GAP) {
            item['count'] += 1;
        }
        item['latest'] = current_time;
        store_item_list(item_list);
        check_and_store_word_meaning(word);
    });
    
});