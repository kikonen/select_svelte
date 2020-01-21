<script context="module">
 const DEBUG = false;

 const I18N_DEFAULTS = {
     clear: 'Clear',
     no_results: 'No results',
     max_limit: 'Max limit reached',
     selected_count: 'selected',
     selected_more: 'more',
 };

 const STYLE_DEFAULTS = {
     container_class: '',
 };

 const FIXED_SORT_KEY = '_';

 const MAX_ITEMS_DEFAULT = 100;
 const FETCH_INDICATOR_DELAY = 150;

 const SUMMARY_LEN = 2;
 const SUMMARY_WRAP = false;

 const FA_CARET_DOWN = 'fas fa-caret-down';
 const FA_CARET_FETCHING = 'far fa-hourglass';

 const FA_SELECTED = 'far fa-check-square';
 const FA_NOT_SELECTED = 'far fa-square';

 const EDIT_KEYS = {
     // Edit keys
     Enter: true,
     Backspace: true,
     Delete: true,
     Insert: true,
 }

 const META_KEYS = {
     // Modifiers
     Control: true,
     Shift: true,
     Alt: true,
     AltGraph: true,
     Meta: true,
     // Special keys
     ContextMenu: true,
     PrintScreen: true,
     ScrollLock: true,
     Pause: true,
     CapsLock: true,
     Numlock: true,
     // Nav keys
     Escape: true,
     Tab: true,
     ArrowDown: true,
     ArrowUp: true,
     ArrowLeft: true,
     ArrowRight: true,
     PageDown: true,
     PageUp: true,
     Home: true,
     End: true,
     // Ignore function keys
     F1: true,
     F2: true,
     F3: true,
     F4: true,
     F5: true,
     F6: true,
     F7: true,
     F8: true,
     F9: true,
     F10: true,
     F11: true,
     F12: true,
 }

 const MUTATIONS = { childList: true };


 function nop() {};

 function hasModifier(event) {
     return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
 }

 function isMetaKey(event) {
     return META_KEYS[event.key] || META_KEYS[event.code]
 }

 function toUnderscore(key) {
     return key.split(/(?=[A-Z])/).join('_').toLowerCase();
 }

 function toDash(key) {
     return key.replace(/_/g, '-');
 }

 function toCamel(key) {
     return key.split(/_/).map(function(e) {
         return e[0].toUppserCase() + e[1, e.length];
     }).join('_').toLowerCase();
 }

 function createItemFromOption(el, styles) {
     let ds = el.dataset;
     let item = {
         id: el.value || '',
         text: el.text || '',
     };
     item.sort_key = item.text;

     if (ds) {
         if (ds.sortKey) {
             item.sort_key = ds.sortKey;
         }

         if (ds.itemSeparator) {
             item.separator = true;
         }
         if (ds.itemDesc) {
             item.desc = ds.itemDesc;
         }
         if (ds.itemAction) {
             item.action = ds.itemAction;
         }
         if (ds.itemClass) {
             item.item_class = ds.itemClass;
         }

         item.data = {};
         Object.keys(ds).forEach(function(key) {
             item.data[toUnderscore(key)] = ds[key];
         });
     }
     if (!item.separator) {
         if (item.id === '') {
             item.blank = true;
         }
     }
     return item;
 }

 function createOptionFromItem(item) {
     let el = document.createElement('option');
     el.setAttribute('value', item.id);
     if (item.desc) {
         el.setAttribute('data-item-desc', item.desc);
     }
     if (item.item_class) {
         el.setAttribute('data-item-class', item.item_class);
     }
     if (item.action) {
         el.setAttribute('data-item-action', item.action);
     }
     if (item.data) {
         Object.keys(item.data).forEach(function(key) {
             el.setAttribute(`data-${toDash(key)}`, item.data[key]);
         });
     }
     el.textContent = item.text;
     return el;
 }

 function createDisplay(data) {
     let byId = {};
     let items = [];
     let blankItem = null;

     let fixedItems = data.fixedItems || [];
     let fetchedItems = data.fetchedItems || [];
     let selectionItems = data.selectionItems || [];

     fixedItems.forEach(function(item) {
         items.push(item);
         if (!item.separator) {
             byId[item.id] = item;
         }
     });

     let otherItems = [];

     if (data.multiple) {
         selectionItems.forEach(function(item) {
             if (!byId[item.id] || item.separator) {
                 otherItems.push(item);
                 if (!item.separator) {
                     byId[item.id] = item;
                 }
             }
         });
     }

     if (otherItems.length) {
         otherItems.push({ id: 'selection_sep', separator: true })
     }

     fetchedItems.forEach(function(item) {
         if (!data.multiple || !byId[item.id] || item.separator) {
             otherItems.push(item);
             if (!item.separator) {
                 byId[item.id] = item;
             }
         }
     });

     if (data.typeahead && otherItems.length && items.length) {
         items.push({ id: 'fixed_sep', separator: true })
     }

     otherItems.forEach(function(item) {
         items.push(item);
     });

     items.forEach(function(item) {
         if (item.blank) {
             blankItem = item;
         }
     });

     return {
         blankItem: blankItem,
         byId: byId,
         displayItems: items
     };
 };

 function createResult(data) {
     let fetchedItems = data.fetchedItems || [];

     fetchedItems.forEach(function(item) {
         if (item.id) {
             item.id = item.id.toString();
         }
         item.sort_key = item.sort_key || item.text;
     });

     let counts = calculateCounts(fetchedItems);
     let more = data.more === true && counts.offsetCount > 0 && !data.fetchedId;

     return {
         fetchedItems: fetchedItems,
         offsetCount: counts.offsetCount,
         actualCount: counts.actualCount,
         more: more,
     };
 }

 function calculateCounts(items) {
     let act = 0;
     let off = 0;

     items.forEach(function(item) {
         if (item.separator) {
             // NOTE KI separator is ignored always
         } else if (!item.id) {
             //NOTE KI dummy items ignored
         } else if (item.placeholder) {
             // NOTE KI does not affect pagination
             act += 1;
         } else {
             // NOTE KI normal or disabled affects pagination
             off += 1;
             act += 1;
         }
     });

     return {
         offsetCount: off,
         actualCount: act
     };
 }
</script>

<script>
 import {beforeUpdate} from 'svelte';
 import {onMount} from 'svelte';

 export let real;
 export let config = {};

 let containerEl;
 let inputEl;
 let toggleEl;
 let popupEl;

 const mutationObserver = new MutationObserver(handleMutation);

 let setupDone = false;
 let translations = {};
 let styles = {};

 let fetcher = inlineFetcher;
 let remote = false;
 let maxItems = MAX_ITEMS_DEFAULT;
 let typeahead = false;
 let summaryLen = SUMMARY_LEN;
 let summaryWrap = SUMMARY_WRAP;
 let keepResult = true;
 let placeholderItem = {
     id: '',
     text: '',
     blank: true
 };

 let mounted = false;

 let query = '';

 let fixedItems = [];
 let fixedById = {};

 let result = createResult({});

 let actualCount = 0;
 let hasMore = false;

 let display = createDisplay({});
 let displayItems = [];

 let selectionById = {};
 let selectionItems = [];
 let selectionTip = '';

 let summarySingle = true;
 let summaryItems = [];

 let showFetching = false;
 let fetchingMore = false;
 let fetchError = null;

 let popupVisible = false;
 let popupTop = false;
 let popupLeft = false;

 let activeFetch = null;

 let previousFetch = null;
 let previousQuery = null;

 let multiple = false;

 let isSyncToReal = false;


 ////////////////////////////////////////////////////////////
 // API
 //
 export function selectItem(id) {
     return fetchItems(false, id).then(function(response) {
         selectItemImpl(id);
     });
 }

 ////////////////////////////////////////////////////////////
 // Utils

 function translate(key) {
     return translations[key];
 }

 function clearQuery() {
     query = '';
     if (!keepResult) {
         previousQuery = null;
     }
 }

 function openPopup() {
     if (!popupVisible) {
         popupVisible = true;
         let w = containerEl.offsetWidth;
         popupEl.style.minWidth = w + "px";

         let bounds = containerEl.getBoundingClientRect();
         let middleY = window.innerHeight / 2;
         let middleX = window.innerWidth / 2;

         popupTop = bounds.y > middleY;
         popupLeft = bounds.x + bounds.width > middleX;
     }
 }

 function closePopup(focusToggle) {
     popupVisible = false;
     updateDisplay();
     if (focusToggle) {
         toggleEl.focus();
     }
 }

 function selectItemImpl(id) {
     id = id.toString();

     let item = display.byId[id];

     if (!item) {
         console.error("MISSING item=" + id);
         return;
     }

     let blankItem = display.blankItem;
     let byId = selectionById;

     if (DEBUG) console.log("SELECT", item);

     if (multiple) {
         if (item.id) {
             if (byId[item.id]) {
                 delete byId[item.id];

                 if (!blankItem) {
                     blankItem = placeholderItem;
                 }
             } else {
                 if (selectionItems.length >= maxItems) {
                     console.warn("IGNORE: maxItems=" + maxItems);
                     return;
                 }

                 delete byId[blankItem.id];
                 byId[item.id] = item;
             }
         } else {
             byId = {
                 [item.id]: item
             }
         }
     } else {
         byId = {
             [item.id]: item
         }
     }

     updateSelection(byId);

     if (!multiple || item.blank) {
         clearQuery();
         closePopup(containsElement(document.activeElement));
     }

     syncToRealSelection();

     real.dispatchEvent(new CustomEvent('select-select', { detail: selectionItems }));
 }

 function executeAction(id) {
     let item = display.byId[id];

     if (!item) {
         console.error("MISSING action item=" + id);
         return;
     }
     closePopup(containsElement(document.activeElement));
     real.dispatchEvent(new CustomEvent('select-action', { detail: item }));
 }

 function selectElement(el) {
     if (el.dataset.action) {
         executeAction(el.dataset.id);
     } else {
         selectItemImpl(el.dataset.id);

         if (el.dataset.selected) {
//             selectionDropdownItems = selectionDropdownItems;
         }
     }
 }

 function clickElement(el) {
     let id = el.dataset.id
     if (id) {
         let item = display.byId[id];

         if (item) {
             real.dispatchEvent(new CustomEvent('select-click', { detail: item }));
         }
     }
 }

 function containsElement(el) {
     return containerEl.contains(el) || popupEl.contains(el);
 }

 ////////////////////////////////////////////////////////////
 // sync/update
 //
 function syncFromRealSelection() {
     if (isSyncToReal) {
         return;
     }

     let oldById = selectionById;
     let byId = {};

     let options = real.selectedOptions;
     for (let i = options.length - 1; i >= 0; i--) {
         let el = options[i];
         let item = oldById[el.value || ''];
         if (!item) {
             item = createItemFromOption(el, styles);
         }
         byId[item.id] = item;
     }

     updateSelection(byId);
 }

 function syncToRealSelection() {
     let changed = false;

     mutationObserver.disconnect();

     // Insert missing values
     // NOTE KI all existing values are *assumed* to be in sync data-attr wise
     if (remote) {
         selectionItems.forEach(function(item) {
             if (multiple && item.blank) {
                 // NOTE KI no "blank" item in multiselection
                 return;
             }

             let el = real.querySelector('option[value="' + item.id + '"]');
             if (!el) {
                 el = createOptionFromItem(item);
                 real.appendChild(el);
             }
         });
     }

     let options = real.options;
     for (let i = options.length - 1; i >= 0; i--) {
         let el = options[i];
         let selected = !!selectionById[el.value];
         changed = changed || el.selected !== selected;
         if (selected) {
             el.setAttribute('selected', '');
             el.selected = true;
         } else {
             el.removeAttribute('selected');
             el.selected = false;
         }
     }

     mutationObserver.observe(real, MUTATIONS);

     if (changed) {
         try {
             isSyncToReal = true;
             real.dispatchEvent(new Event('change'));
         } finally {
             isSyncToReal = false;
         }
     }
 }

 function updateFixedItems() {
     let byId = {}
     let items = [];

     if (multiple) {
         items.push(placeholderItem);
     }

     let options = real.options;
     for (let i = 0; i < options.length; i++) {
         let el = options[i];
         if (!el.value || el.dataset.itemFixed != null) {
             let item = createItemFromOption(el, styles);
             item.sort_key = FIXED_SORT_KEY + item.sort_key;
             item.fixed = true;
             byId[item.id] = item;
             items.push(item);
         }
     }

     let blankItem = byId[''];
     if (blankItem) {
         blankItem.blank = true;
     }

     fixedItems = items;
     fixedById = byId;
 }

 function updateDisplay() {
     display = createDisplay({
         typeahead: typeahead,
         multiple: multiple,
         fixedItems: fixedItems,
         fetchedItems: result.fetchedItems,
         selectionItems: selectionItems,
     });
     displayItems = display.displayItems;
 }

 function updateSelection(byId) {
     let items = Object.values(byId);
     if (items.length == 0) {
         let blankItem = display.blankItem || placeholderItem;
         byId = {
             [blankItem.id]: blankItem
         }
         items = [blankItem];
     }

     selectionById = byId;
     selectionItems = items.sort(function(a, b) {
         return a.sort_key.localeCompare(b.sort_key);
     });

     let tip = selectionItems.map(function(item) {
         return item.text;
     }).join(', ');

     let len = selectionItems.length;
     if (len > 1) {
         summaryItems = selectionItems.slice(0, summaryLen);
         if (summaryItems.length < len) {
             summaryItems.push({
                 id: 'more',
                 text: `${len - summaryLen} ${translate('selected_more')}`,
                 item_class: 'ss-summary-more',
             });
         }

         selectionTip = `${len} ${translate('selected_count')}: ${tip}`
     } else {
         summaryItems = selectionItems;
         if (summaryItems[0].blank) {
             selectionTip = '';
         } else {
             selectionTip = summaryItems[0].text;
         }
     }
     summarySingle = summaryItems[0].blank || !multiple;
 }

 function reload() {
     if (isSyncToReal) {
         return;
     }
     updateFixedItems();
     syncFromRealSelection();
     result = createResult({});
     updateDisplay();
     previousQuery = null;

     // NOTE KI need to force refetch immediately (or lazily in popup open)
     if (popupVisible) {
         fetchItems(false, null);
     }

     if (DEBUG) console.log(display);
 }

 ////////////////////////////////////////////////////////////
 // Fetch
 //
 function inlineFetcher(offset, query) {
     if (DEBUG) console.log("INLINE_SELECT_FETCH: " + query);

     function createItems() {
         let items = []
         let pattern = query.toUpperCase().trim();

         let options = real.options;
         for (let i = 0; i < options.length; i++) {
             let item = createItemFromOption(options[i], styles);
             let match;

             // NOTE KI "blank" is handled as fixed item
             if (item.blank) {
                 match = false;
             } else {
                 match = item.separator ||
                         item.text.toUpperCase().includes(pattern) ||
                         (item.desc && item.desc.toUpperCase().includes(pattern));
             }

             if (match) {
                 items.push(item);
             }
         }
         return items;
     }

     let promise = new Promise(function(resolve, reject) {
         resolve({
             items: createItems(),
             info: {
                 more: false,
             }
         });
     });

     return promise;
 }

 /**
  * @return Promise
  */
 function fetchItems(fetchMore, fetchId) {
     let currentQuery;
     if (fetchId) {
         currentQuery = '';
     } else {
         currentQuery = query.trim();
         if (currentQuery.length > 0) {
             currentQuery = query;
         }
     }

     if (!fetchMore && !fetchingMore && currentQuery === previousQuery && !fetchId) {
         return activeFetch || previousFetch;
     }

     if (DEBUG) console.debug("START fetch: " + currentQuery, document.activeElement, result.fetchedItems.slice());
     if (DEBUG) console.debug("START DISPLAY", displayItems.slice());

     cancelFetch();

     let currentFetchOffset = 0;

     if (fetchMore) {
         currentFetchOffset = result.offsetCount;
     } else {
         hasMore = false;
     }
     fetchingMore = fetchMore;
     fetchError = null;
     showFetching = false;

     let currentFetchingMore = fetchingMore;

     let currentFetch = fetcher(currentFetchOffset, currentQuery, fetchId).then(function(response) {
         if (currentFetch === activeFetch) {
             if (DEBUG) console.debug("DONE fetch: " + currentQuery, document.activeElement, response.items.slice());

             let responseItems = response.items || [];
             let info = response.info || {};

             let fetchedItems = responseItems;
             if (currentFetchingMore) {
                 fetchedItems = result.fetchedItems;
                 responseItems.forEach(function(item) {
                     fetchedItems.push(item);
                 });
             }

             result = createResult({
                 fetchedItems: fetchedItems,
                 fetchedId: fetchId,
                 more: info.more,
             });

             if (DEBUG) console.debug("NEW RESULT", result.fetchedItems.slice());

             actualCount = result.actualCount;
             hasMore = result.more;

             if (currentFetchingMore) {
                 responseItems.forEach(function(item) {
                     display.displayItems.push(item);
                     display.byId[item.id] = item;
                 });
                 displayItems = display.displayItems;
             } else {
                 updateDisplay();
             }

             if (DEBUG) console.debug("NEW DISPLAY", displayItems.slice());

             if (fetchId) {
                 previousQuery = null;
             } else {
                 previousQuery = currentQuery;
             }
             previousFetch = currentFetch;
             activeFetch = null;
             fetchingMore = false;
             showFetching = false;

             setTimeout(function() {
                 fetchMoreIfneeded();
             });
         }
     }).catch(function(err) {
         if (currentFetch === activeFetch) {
             console.error(err);

             fetchError = err;

             let result = createResult({});
             actualCount = result.actualCount;
             hasMore = result.more;

             updateDisplay();

             previousQuery = null;
             previousFetch = currentFetch;
             activeFetch = null;
             fetchingMore = false;

             showFetching = false;

             toggleEl.focus();
             openPopup();
         }
     });

     setTimeout(function() {
         if (activeFetch === currentFetch) {
             if (DEBUG) console.log("fetching...");
             showFetching = true;
         }
     }, FETCH_INDICATOR_DELAY);

     activeFetch = currentFetch;
     previousFetch = null;

     return currentFetch;
 }

 function cancelFetch() {
     if (activeFetch !== null) {
         activeFetch = null;

         // no result fetched; since it doesn't match input any longer
         previousQuery = null;
     }
 }

 function fetchMoreIfneeded() {
     if (hasMore && !fetchingMore && popupVisible) {
         if (popupEl.scrollTop + popupEl.clientHeight >= popupEl.scrollHeight - popupEl.lastElementChild.clientHeight * 2 - 2) {
             fetchItems(true);
         }
     }
 }

 ////////////////////////////////////////////////////////////
 // Setup
 //
 $: {
     if (mounted) {
         syncToRealSelection();
     }
 }

 onMount(function() {
     // Initial selection
     syncFromRealSelection();

     Object.keys(eventListeners).forEach(function(ev) {
         real.addEventListener(ev, eventListeners[ev]);
     });

     mounted = true;
 });

 beforeUpdate(function() {
     if (!setupDone) {
         setupComponent();
         setupDone = true;
     }
 });

 function setupComponent() {
     real.classList.add('d-none');
     multiple = real.multiple;

     if (config.remote) {
         remote = true;
         fetcher = config.fetcher;
     }
     typeahead = config.typeahead || false;
     maxItems = config.maxItems || MAX_ITEMS_DEFAULT;
     summaryLen = config.summaryLen || SUMMARY_LEN;
     summaryWrap = config.summaryWrap != null ? config.summaryWrap : SUMMARY_WRAP;

     keepResult = config.keepResult != null ? config.keepResult : true;

     Object.assign(translations, I18N_DEFAULTS);
     if (config.translations) {
         Object.assign(translations, config.translations);
     }

     Object.assign(styles, STYLE_DEFAULTS);
     if (config.styles) {
         Object.assign(styles, config.styles);
     }

     maxItems = config.maxItems || MAX_ITEMS_DEFAULT;
     placeholderItem.text = config.placeholder || '';

     jQuery(toggleEl).tooltip();

     mutationObserver.observe(real, MUTATIONS);

     updateFixedItems();
     updateDisplay();
 }

 function handleMutation(mutationsList, observer) {
     for (let mutation of mutationsList) {
         if (mutation.type === 'childList') {
             reload();
         }
     }
 }

 let eventListeners = {
     change: function(event) {
         if (DEBUG) console.log(event);
         if (!isSyncToReal) {
             syncFromRealSelection();
         }
     },
     'select-reload': function(event) {
         if (DEBUG) console.log(event);
         reload();
     },
 }


 ////////////////////////////////////////////////////////////
 // Handlers
 //
 let toggleKeydownHandlers = {
     base: function(event) {
         if (!popupVisible || isMetaKey(event)) {
             return;
         }
         if (typeahead) {
             inputEl.focus();
         } else {
             focusNextByKey(event.key);
         }
     },
     ArrowDown: function(event) {
         openPopup();
         fetchItems();

         if (typeahead) {
             inputEl.focus();
         } else {
             let next = popupEl.querySelectorAll('.ss-js-item')[0];
             while (next && next.classList.contains('ss-js-dead')) {
                 next = next.nextElementSibling;
             }
             focusItem(next);
         }
         event.preventDefault();
     },
     ArrowUp: nop,
     Enter: function(event) {
         if (hasModifier(event)) {
             return;
         }
         if (popupVisible) {
             // NOTE KI don't cancel fetch
             clearQuery();
             closePopup(false);
         } else {
             openPopup();
             fetchItems(false);
         }
         event.preventDefault();
     },
     Space: function(event) {
         if (hasModifier(event)) {
             return;
         }
         if (popupVisible) {
             // NOTE KI don't cancel fetch
             clearQuery();
             closePopup(false);
         } else {
             openPopup();
             fetchItems(false);
         }
         event.preventDefault();
     },
     Escape: function(event) {
         cancelFetch();
         clearQuery();
         closePopup(false);
     },
     Delete: function(event) {
         selectItem('');
     },
 };

 let toggleKeyupHandlers = {
     base: nop,
 }

 let inputKeypressHandlers = {
     base: function(event) {
     },
 };

 let inputKeydownHandlers = {
     base: nop,
     ArrowDown: function(event) {
         let next = popupEl.querySelectorAll('.ss-js-item')[0];
         while (next && next.classList.contains('ss-js-dead')) {
             next = next.nextElementSibling;
         }
         focusItem(next);
         event.preventDefault();
     },
     ArrowUp: function(event) {
         // NOTE KI closing popup here is *irritating* i.e. if one is trying to select
         // first entry in dropdown
         event.preventDefault();
     },
     Escape: function(event) {
         cancelFetch();
         clearQuery();
         closePopup(true);
     },
     Tab: function(event) {
         toggleEl.focus();
         event.preventDefault();
     },
 };

 let inputKeyupHandlers = {
     base: function(event) {
         if (!isMetaKey(event)) {
             fetchItems();
         }
     },
 }

 function focusNextByKey(ch) {
     ch = ch.toUpperCase();

     let nodes = popupEl.querySelectorAll('.ss-js-item');

     let curr = document.activeElement;
     if (curr.classList.contains('ss-js-item')) {
         curr = curr.nextElementSibling;
     } else {
         curr = null;
     }
     if (!curr) {
         curr = nodes[0];
     }

     let start = curr;
     let rolled = false;
     let found = false;
     let idx = 0;
     while (curr && !found && idx < nodes.length) {
         let item = curr.dataset && display.byId[curr.dataset.id];
         found = item && item.text && item.text.toUpperCase().startsWith(ch);
         idx++;
         if (!found) {
             curr = curr.nextElementSibling;
             if (!curr) {
                 curr = nodes[0];
             }
         }
     }
     if (idx >= nodes.length) {
         curr = null;
     }
     focusItem(curr);
 }

 function focusItem(item) {
     if (item) {
         if (typeahead && popupEl.children[1] === item) {
             popupEl.scroll(0, 0);
         }
//         item.scrollIntoView();
         item.focus();
     }
 }

 function focusPreviousItem(el) {
     let next = el.previousElementSibling;

     if (next) {
         while (next && next.classList.contains('ss-js-dead')) {
             next = next.previousElementSibling;
         }
         if (next && !next.classList.contains('ss-js-item')) {
             next = null;
         }
     }

     if (!next) {
         next = typeahead ? inputEl : toggleEl;
     }

     focusItem(next);

     return next;
 }

 function focusNextItem(el) {
     let next = el.nextElementSibling;

     if (next) {
         while (next && next.classList.contains('ss-js-dead')) {
             next = next.nextElementSibling;
         }

         if (next && !next.classList.contains('ss-js-item')) {
             next = null;
         }
     }

     focusItem(next);

     return next;
 }

 let itemKeydownHandlers = {
     base: function(event) {
         if (isMetaKey(event)) {
             return;
         }
         if (typeahead) {
             inputEl.focus();
         } else {
             focusNextByKey(event.key);
         }
     },
     ArrowDown: function(event) {
         if (!fetchingMore) {
//             console.log("BLOCKED down");
             focusNextItem(event.target);
         }
         event.preventDefault();
     },
     ArrowUp: function(event) {
         focusPreviousItem(event.target);
         event.preventDefault();
     },
     Enter: function(event) {
         if (!hasModifier(event)) {
             selectElement(event.target);
             event.preventDefault();
         }
     },
     Space: function(event) {
         if (hasModifier(event)) {
             return;
         }
         if (typeahead) {
             inputEl.focus();
         } else {
             selectElement(event.target);
             event.preventDefault();
         }
     },
     Escape: function(event) {
         cancelFetch();
         clearQuery();
         closePopup(true);
     },
     Tab: function(event) {
         toggleEl.focus();
         event.preventDefault();
     },
 };

 let itemKeyupHandlers = {
     base: nop,
     // allow "meta" keys to navigate in items
     PageUp: function(event) {
         let scrollLeft = document.body.scrollLeft;
         let scrollTop = document.body.scrollTop;

         let rect = popupEl.getBoundingClientRect();
         let next = document.elementFromPoint(scrollLeft + rect.x + 10, scrollTop + rect.top + 1);
         if (!next) {
             next = popupEl.querySelector('.ss-js-item:first-child');
         } else {
             if (!next.classList.contains('ss-js-item')) {
                 next = popupEl.querySelector('.ss-js-item:first-child');
             }
         }
         focusItem(next);
         event.preventDefault();
     },
     PageDown: function(event) {
         let scrollLeft = document.body.scrollLeft;
         let scrollTop = document.body.scrollTop;
         let h = popupEl.offsetHeight;

         let rect = popupEl.getBoundingClientRect();
         let next = document.elementFromPoint(scrollLeft + rect.x + 10, scrollTop + rect.top + h - 10);
         if (!next) {
             next = popupEl.querySelector('.ss-js-item:last-child');
         } else {
             if (!next.classList.contains('ss-js-item')) {
                 next = popupEl.querySelector('.ss-js-item:last-child');
             }
         }
         focusItem(next);
         event.preventDefault();
     },
     Home: function(event) {
         let next = popupEl.querySelector('.ss-js-item:first-child');
         focusItem(next);
         event.preventDefault();
     },
     End: function(event) {
         let next = popupEl.querySelector('.ss-js-item:last-child');
         focusItem(next);
         event.preventDefault();
     },
 }


 ////////////////////////////////////////////////////////////
 //
 function handleKeyEvent(event, handlers) {
     if (DEBUG) console.debug(event);
     (handlers[event.key] || handlers[event.code] || handlers.base)(event);
 }

 function handleBlur(event) {
     if (event.sourceCapabilities && !containsElement(event.relatedTarget)) {
         if (DEBUG) console.log("BLUR", event);

         cancelFetch();

         clearQuery();
         closePopup(false);

         // TODO KI *WHY* this redundant sync was done?!?
//         syncFromRealSelection();
     } else {
         if (DEBUG) console.log("IGNORE_BLUR", event);
     }
 }

 function handleInputBlur(event) {
     handleBlur(event);
 }

 function handleInputKeypress(event) {
     handleKeyEvent(event, inputKeypressHandlers);
 }

 function handleInputKeydown(event) {
     handleKeyEvent(event, inputKeydownHandlers);
 }

 function handleInputKeyup(event) {
     handleKeyEvent(event, inputKeyupHandlers);
 }

 function handleToggleKeydown(event) {
     handleKeyEvent(event, toggleKeydownHandlers);
 }

 function handleToggleKeyup(event) {
     handleKeyEvent(event, toggleKeyupHandlers);
 }

 function handleToggleClick(event) {
     if (event.button === 0 && !hasModifier(event)) {
         if (popupVisible) {
             closePopup(false);
         } else {
             openPopup();
             fetchItems(false);
         }
     }
 }

 function handleItemKeydown(event) {
     handleKeyEvent(event, itemKeydownHandlers);
 }

 function handleItemKeyup(event) {
     handleKeyEvent(event, itemKeyupHandlers);
 }

 function handleItemClick(event) {
     if (event.button === 0) {
         if (!hasModifier(event)) {
             selectElement(event.target)
         } else if (event.ctrlKey || event.metaKey) {
             clickElement(event.target)
         }
     }
 }

 function handlePopupScroll(event) {
     fetchMoreIfneeded();
 }
</script>

<!-- ------------------------------------------------------------ -->
<!-- ------------------------------------------------------------ -->
<style>
</style>

<!-- ------------------------------------------------------------ -->
<!-- ------------------------------------------------------------ -->
<div class="form-control ss-container {styles.container_class}"
     id="ss_container_{real.id}"
     name="ss_container_{real.name}"
     bind:this={containerEl}>

  <button class="form-control ss-control"
          name="ss_control_{real.name}"
          type="button"
          tabindex="0"
          title="{selectionTip}"
          bind:this={toggleEl}
          on:blur={handleBlur}
          on:keydown={handleToggleKeydown}
          on:keyup={handleToggleKeyup}
          on:click={handleToggleClick}>

    <span class:ss-summary-multiple={!summarySingle}
          class:ss-summary-single={summarySingle}>
      {#each summaryItems as item, index (item.id)}
        <span class="{item.item_class || ''}"
              class:ss-blank={item.blank}
              class:ss-summary-item-multiple={!summarySingle}
              class:ss-summary-item-single={summarySingle}
              >
          {item.text}
        </span>
      {/each}
    </span>
    <span class="ss-caret {showFetching ? FA_CARET_FETCHING : FA_CARET_DOWN}">
    </span>
  </button>

  <div class="dropdown-menu ss-popup"
       class:show={popupVisible}
       class:ss-popup-top={popupTop}
       class:ss-popup-left={popupLeft}
       bind:this={popupEl}
       on:scroll={handlePopupScroll}>
    {#if typeahead}
        <div class="ss-input-item" tabindex="-1">
          <input class="form-control ss-input"
                 tabindex=1
                 autocomplete="new-password"
                 autocorrect=off
                 autocapitalize=off
                 spellcheck=off

                 bind:this={inputEl}
                 bind:value={query}
                 on:blur={handleInputBlur}
                 on:keypress={handleInputKeypress}
                 on:keydown={handleInputKeydown}
                 on:keyup={handleInputKeyup}>
          </div>
    {/if}

    {#each displayItems as item (item.id)}
      {#if item.separator}
        <div tabindex="-1"
             class="dropdown-divider ss-js-dead"
             on:keydown={handleItemKeydown}>
        </div>

      {:else if item.disabled || item.placeholder}
        <div tabindex="-1" class="dropdown-item ss-item-muted ss-js-dead"
             on:keydown={handleItemKeydown}>
          <div class="ss-item-text {item.item_class}">
            {item.text}
          </div>

          {#if item.desc}
            <div class="ss-item-desc">
              {item.desc}
            </div>
          {/if}
        </div>

      {:else}
        <div tabindex=1
             class="dropdown-item ss-item ss-js-item {item.item_class || ''}"
             class:ss-item-selected={!item.blank && selectionById[item.id]}
             data-id="{item.id}"
             data-action="{item.action || ''}"
             on:blur={handleBlur}
             on:click={handleItemClick}
             on:keydown={handleItemKeydown}
             on:keyup={handleItemKeyup}>

          <div class="ss-no-click">
            {#if multiple && !item.blank}
              <div class="d-inline-block align-top">
                <i class="ss-marker {selectionById[item.id] ? FA_SELECTED : FA_NOT_SELECTED}"></i>
              </div>
            {/if}

            <div class="d-inline-block">
              {#if item.blank}
                <div class="ss-blank">
                  {#if multiple}
                    {translate('clear')}
                  {:else}
                    {item.text}
                  {/if}
                </div>
              {:else}
                <div class="ss-item-text {item.item_class || ''}">
                  {item.text}
                </div>

                {#if item.desc}
                  <div class="ss-item-desc">
                    {item.desc}
                  </div>
                {/if}
              {/if}
            </div>
          </div>
        </div>
      {/if}
    {/each}

    {#if typeahead && actualCount === 0 && previousFetch && !activeFetch}
      <div tabindex="-1" class="dropdown-item ss-message-item ss-item-muted ss-js-dead">
        {translate('no_results')}
      </div>
    {/if}

    {#if fetchError}
      <div tabindex="-1" class="dropdown-item border-top text-danger ss-message-item ss-sticky-item ss-js-dead">
        {fetchError}
      </div>
    {/if}

    {#if selectionItems.length >= maxItems}
      <div tabindex="-1" class="dropdown-item border-top text-danger ss-message-item ss-sticky-item ss-js-dead">
        {translate('max_limit')} ({maxItems})
      </div>
    {/if}
  </div>
</div>
