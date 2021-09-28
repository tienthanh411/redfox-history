const REDFOX_PREFIX = "https://redfoxsanakirja.fi/fi/sanakirja/-/s/fin/eng/";
const STORAGE_KEY = 'word_list';
const MAX_DISPLAYED_WORDS = 30;

function create_item_info_dom(item) {
    if (item.info === undefined) {
        return null;
    }
    var info_dom = document.createElement('div');
    info_dom.className = 'word-info hidden';
    ul = document.createElement('ul');
    var meanings = [...new Set(item.info.subtitleResult.query.word2)];
    meanings.forEach(function (s) {
        var li = document.createElement('li');
        li.textContent = s;
        ul.appendChild(li);
    })
    info_dom.appendChild(ul);
    return info_dom;
}

function remove_item(item, callback) {
    get_stored_item_list(function (item_list) {
        for (var i = 0; i < item_list.length; i++) {
            if (item_list[i]['word'] == item['word']) {
                item_list.splice(i, 1);
                break;
            }
        }
        store_item_list(item_list, callback);
    });
}

function create_item_dom(index, item) {
    // Info DOM contains a list of the word's possible meanings
    var info_dom = create_item_info_dom(item);

    var url = REDFOX_PREFIX + item.word;
    // Text DOM contains the word and link to redfox
    var text = decodeURI(item.word);
    var text_dom = document.createElement('a');
    text_dom.className = 'word-link'
    text_dom.target = '_blank';
    text_dom.href = url;
    text_dom.appendChild(document.createTextNode(text));

    // Word index
    var index_dom = document.createElement('span');
    index_dom.className = 'word-index'
    index_dom.textContent = '-';

    // Remove button
    var remove_btn = document.createElement('button');
    remove_btn.className = 'item-action-btn hidden'
    remove_btn.textContent = 'x';
    remove_btn.addEventListener('click', function (event) {
        remove_item(item);
        remove_btn.parentElement.remove();
    });

    // Container of all
    var ret = document.createElement('div');
    ret.className = 'word-container';
    ret.appendChild(index_dom);
    ret.appendChild(text_dom);
    ret.appendChild(remove_btn);
    if (info_dom) {
        ret.appendChild(info_dom);
    }
    
    return ret;
}

function create_item_panel() {
    var ret = document.createElement('div');
    ret.className = 'item-panel';
    return ret;
}

function get_stored_item_list(callback) {
    chrome.storage.local.get(STORAGE_KEY, function (data) {
        var item_list = [];
        if (data[STORAGE_KEY] !== undefined) {
            item_list = data[STORAGE_KEY];
        }
        callback(item_list);
    });
}

function store_item_list(item_list, callback) {
    var set_data = {};
    set_data[STORAGE_KEY] = item_list;
    chrome.storage.local.set(set_data, function () { 
        if (callback !== undefined) {
            callback();
        }
    });
}

function remove_all_child_nodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function display_most_recent() {
    var item_list_dom = document.getElementById('item-list');
    remove_all_child_nodes(item_list_dom);

    get_stored_item_list(function (item_list) {
        if (item_list.length == 0) {
            return;
        }
        item_list.sort(function (a, b) {
            return b['latest'] - a['latest'];
        });

        var panels = []
        for (var i = 0; i < 2; i++) {
            panels[i] = create_item_panel();
            item_list_dom.appendChild(panels[i]);
        }

        var len = Math.min(MAX_DISPLAYED_WORDS, item_list.length);
        for (var i = 0; i < len; i++) {
            var word_dom = create_item_dom(i + 1, item_list[i]);
            if (i < len / 2) {
                panels[0].appendChild(word_dom);
            } else {
                panels[1].appendChild(word_dom);
            }
        }
    });
}

window.addEventListener('load', (event) => {
    var clear_all_btn = document.getElementById('clear-all-btn');
    clear_all_btn.addEventListener('click', function () {
        chrome.storage.local.remove(STORAGE_KEY, function () { });
        display_most_recent();
    });

    display_most_recent();
});

