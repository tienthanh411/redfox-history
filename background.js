
const REDFOX_PREFIX = "https://redfoxsanakirja.fi/fi/sanakirja/-/s/fin/eng/";
const REDFOX_API_PREFIX = 'https://api.redfoxsanakirja.fi/redfox-api/api/basic/query/fin/eng/';
const STORAGE_KEY = 'word_list';
const TIME_GAP = 60*1000; // 60 seconds


function store_word_info(word, info) {
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
        item['info'] = info;
        store_item_list(item_list);
    });
}

function remove_word(word) {
    get_stored_item_list(function (item_list) {
        var item = null;
        for (var i = 0; i < item_list.length; i++) {
            if (item_list[i]['word'] == word) {
                item_list.splice(i, 1);
                break;
            }
        }
        store_item_list(item_list);
    });
}

async function check_and_store_word_info(word) {
    var url = REDFOX_API_PREFIX + word;
    var response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json, text/plain, */*',
        },
    });
    if (response.status != 200) {
        remove_word(word);
        return;
    }

    const response_json = await response.json();
    if (response_json.subtitleResult.query.word2 === undefined) {
        remove_word(word);
    } else {
        store_word_info(word, response_json);
    }
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
    chrome.storage.local.set(set_data, function () { });
}

function is_valid_word(word) {
    var decoded_word = decodeURI(word);
    return !/[^a-zA-ZÄÖäö ]/.test(decoded_word);
}

chrome.tabs.onUpdated.addListener(function (_, change_info, tab) {
    if (change_info.status != 'complete' || !tab.url.startsWith(REDFOX_PREFIX)) {
        return;
    }

    const word = tab.url.split('/').pop();
    if (!is_valid_word(word)) {
        console.log('Invalid word: ' + word);
        return;
    }
    console.log('Checking: ' + word);

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
            item_list.push(item);
        }
        var current_time = Date.now();
        if (current_time - item['latest'] > TIME_GAP) {
            item['count'] += 1;
        }
        item['latest'] = current_time;
        store_item_list(item_list);
        check_and_store_word_info(word);
    });
    
});