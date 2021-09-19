const REDFOX_PREFIX = "https://redfoxsanakirja.fi/fi/sanakirja/-/s/fin/eng/";
const STORAGE_KEY = 'word_list';
const MAX_DISPLAYED_WORDS = 30;

function create_item_dom(index, item) {
    var url = REDFOX_PREFIX + item.word;
    
    var meaning_dom = null;
    if (item.meaning.length > 0) {
        meaning_dom = document.createElement('div');
        meaning_dom.className = 'meaning-container';
        ul = document.createElement('ul');
        item.meaning.forEach(function (s) {
            var li = document.createElement('li');
            li.textContent = s;
            ul.appendChild(li);
        })
        meaning_dom.appendChild(ul);
    }

    var text = decodeURI(item.word);
    var text_dom = document.createElement('a');
    text_dom.className = 'word-link'
    text_dom.target = '_blank';
    text_dom.href = url;
    text_dom.appendChild(document.createTextNode(text));

    var index_dom = document.createElement('span');
    index_dom.textContent = index + ". ";

    var ret = document.createElement('div');
    ret.className = 'word-container';
    ret.appendChild(index_dom);
    ret.appendChild(text_dom);
    if (meaning_dom) {
        ret.appendChild(meaning_dom);
    }
    
    return ret;
}

function create_item_panel() {
    var ret = document.createElement('div');
    ret.className = 'float-child';
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

function remove_all_child_nodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function display_most_recent() {
    var item_list_dom = document.getElementById("item-list");
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

