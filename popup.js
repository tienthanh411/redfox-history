const REDFOX_PREFIX = "https://redfoxsanakirja.fi/fi/sanakirja/-/s/fin/eng/";
const STORAGE_KEY = 'word_list';
const MAX_DISPLAYED_WORDS = 30;

function create_word_dom(index, word) {
    var text = document.createTextNode(decodeURI(word));
    var text_dom = document.createElement('a');
    text_dom.className = 'word-link'
    text_dom.appendChild(text);
    text_dom.target = '_blank';
    text_dom.href = REDFOX_PREFIX + word;

    var index_dom = document.createElement('span');
    index_dom.textContent = index + ". ";

    var ret = document.createElement('div');
    ret.className = 'word-container';
    ret.appendChild(index_dom);
    ret.appendChild(text_dom);
    return ret;
}

function create_word_panel() {
    var ret = document.createElement('div');
    ret.className = 'float-child';
    return ret;
}

function display_most_recent(item_list) {
    if (item_list.length == 0) {
        return;
    }
    item_list.sort(function(a, b) {
        return b['latest'] - a['latest'];
    });
    
    var word_list_dom = document.getElementById("word-list");
    
    var panels = []
    for (var i = 0; i < 2; i++) {
        panels[i] = create_word_panel();
        word_list_dom.appendChild(panels[i]);
    }
    
    var len = Math.min(MAX_DISPLAYED_WORDS, item_list.length);
    for (var i = 0; i < len; i++) {
        var word_dom = create_word_dom(i + 1, item_list[i]['word']);
        if (i < len/2) {
            panels[0].appendChild(word_dom);
        } else {
            panels[1].appendChild(word_dom);
        }
        
    }

}

chrome.storage.local.get(STORAGE_KEY, function(data) {
    var item_list = [];
    if (data[STORAGE_KEY] !== undefined) {
        item_list = data[STORAGE_KEY];
    }
    display_most_recent(item_list);
    
});