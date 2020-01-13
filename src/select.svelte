<script context="module">
 const DEBUG = false;

 const I18N_DEFAULTS = {
     clear: 'Clear',
     no_results: 'No results',
     max_limit: 'Max limit reached',
 };

 const STYLE_DEFAULTS = {
     container_class: '',
     item_class: '',
     item_desc_class: 'text-muted',
     blank_item_class: 'text-muted',
     selected_item_class: 'alert-primary',
     typeahead_class: '',
     control_class: '',
 };

 const MAX_ITEMS_DEFAULT = 100;
 const FETCH_INDICATOR_DELAY = 150;

 const FA_CARET_DOWN = 'text-dark fas fa-caret-down';
 const FA_CARET_FETCHING = 'text-muted far fa-hourglass';

 const FA_SELECTED = 'text-muted far fa-check-square';
 const FA_NOT_SELECTED = 'text-muted far fa-square';


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

 function createItemFromOption(el, styles) {
     let ds = el.dataset;
     let item = {
         id: el.value || '',
         text: el.text || '',
     };

     if (ds) {
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
         if (!item.item_class) {
             item.item_class = item.blank ? styles.blank_item_class : styles.item_class;
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
     // TODO KI assign all data attributes
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

 let setupDone = false;
 let translations = {};
 let styles = {};
 let basename = '';

 let fetcher = inlineFetcher;
 let remote = false;
 let maxItems = MAX_ITEMS_DEFAULT;
 let typeahead = false;
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
 let selectionTitle = '';

 let showFetching = false;
 let fetchingMore = false;
 let fetchError = null;

 let popupVisible = false;
 let popupTop = false;

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
     previousQuery = null;
 }

 function openPopup() {
     if (!popupVisible) {
         popupVisible = true;
         let w = containerEl.offsetWidth;
         popupEl.style.minWidth = w + "px";

         let bounds = containerEl.getBoundingClientRect();
         let middle = window.innerHeight / 2;
         popupTop = bounds.y > middle;
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

/*
     if (remote) {
         syncToRealSelection();
     }
*/

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

     let items = Object.values(byId);
     if (items.length == 0 && blankItem) {
         byId = {
             [blankItem.id]: blankItem
         }
         items = [blankItem];
     }

     selectionById = byId;
     selectionItems = items.sort(function(a, b) {
         return a.text.localeCompare(b.text);
     });

     selectionTitle = selectionItems.map(function(item) {
         return item.text;
     }).join(', ');

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

     selectionById = byId;
     selectionItems = Object.values(byId).sort(function(a, b) {
         return a.text.localeCompare(b.text);
     });

     if (selectionItems.length == 0 && multiple) {
         selectionById[''] == placeholderItem;
         selectionItems.push(placeholderItem);
     }

     selectionTitle = selectionItems.map(function(item) {
         return item.text;
     }).join(', ');
 }

 function syncToRealSelection() {
     let changed = false;

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

 ////////////////////////////////////////////////////////////
 // Fetch
 //
 function inlineFetcher(offset, query) {
     if (DEBUG) console.log("INLINE_SELECT_FETCH: " + query);

     let promise = new Promise(function(resolve, reject) {
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

         let response = {
             items: items,
             info: {
                 more: false,
             }
         }
         resolve(response);
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

//     console.debug("START fetch: " + currentQuery);

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

     Object.assign(translations, I18N_DEFAULTS);
     if (config.translations) {
         Object.assign(translations, config.translations);
     }

     Object.assign(styles, STYLE_DEFAULTS);
     if (config.styles) {
         Object.assign(styles, config.styles);
     }

     basename = real.name;
     maxItems = config.maxItems || MAX_ITEMS_DEFAULT;
     placeholderItem.text = config.placeholder || '';
     placeholderItem.item_class = styles.blank_item_class;

     jQuery(toggleEl).tooltip();

     updateFixedItems();
     updateDisplay();
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
         if (!isSyncToReal) {
             updateFixedItems();
             syncFromRealSelection();

             // NOTE KI need to force refetch immediately (or lazily in popup open)
             previousQuery = null;
             if (popupVisible) {
                 fetchItems(false, null);
             } else {
                 updateDisplay();
             }

             if (DEBUG) console.log(display);
         }
     },
 }

 ////////////////////////////////////////////////////////////
 // Handlers
 //
 let toggleKeydownHandlers = {
     base: function(event) {
         if (typeahead && popupVisible && !isMetaKey(event)) {
             inputEl.focus();
         }
     },
     ArrowDown: function(event) {
         openPopup();
         fetchItems();

         if (typeahead) {
             inputEl.focus();
         } else {
             let next = popupEl.querySelectorAll('.ss-js-item')[0];
             while (next && next.classList.contains('ss-js-blank')) {
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
         while (next && next.classList.contains('ss-js-blank')) {
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

 function focusItem(item) {
     if (item) {
         if (typeahead && popupEl.children[1] === item) {
             popupEl.scroll(0, 0);
         }
         item.focus();
     }
 }

 function focusPreviousItem(el) {
     let next = el.previousElementSibling;

     if (next) {
         while (next && next.classList.contains('ss-js-blank')) {
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
         while (next && next.classList.contains('ss-js-blank')) {
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
         if (typeahead && !isMetaKey(event)) {
             inputEl.focus();
         }
     },
     ArrowDown: function(event) {
         focusNextItem(event.target);
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
     if (event.button === 0 && !hasModifier(event)) {
         selectElement(event.target)
     }
 }

 function handlePopupScroll(event) {
     fetchMoreIfneeded();
 }
</script>

<!-- ------------------------------------------------------------ -->
<!-- ------------------------------------------------------------ -->
<style>
 :global(.ss-container) {
     position: relative;
 }
 :global(.ss-selection) {
     width: 100%;
     height: 100%;

     white-space: nowrap;
     overflow: hidden;
     text-overflow: ellipsis;
 }
 :global(.ss-selected-item) {
     white-space: nowrap;
/*
     overflow: hidden;
     word-break: break-all;
     text-overflow: ellipsis;
*/ }
 :global(.ss-popup) {
     padding-top: 0;
     padding-bottom: 0;
     max-height: 40vh;
     max-width: 90vw;
     overflow-y: auto;
 }
 :global(.ss-popup-top) {
     top: unset;
     bottom: 100%;
 }
 :global(.ss-item) {
     padding-left: 0.5rem;
     padding-right: 0.5rem;
 }
 :global(.ss-message-item) {
     padding-left: 0.5rem;
     padding-right: 0.5rem;
 }
 :global(.ss-sticky-item) {
     width: 100%;
     position: sticky;
     bottom: 0;
     background-color: white;
 }
 :global(.ss-input-item) {
     width: 100%;
     position: sticky;
     top: 0;
     background-color: white;
     padding-top: 0.2rem;
     padding-bottom: 0.2rem;
     padding-left: 0.2rem;
     padding-right: 0.2rem;
 }
 :global(.ss-input) {
 }
 :global(.ss-no-click) {
     pointer-events: none;
 }

/*
 :global(.ki-caret-container) {
     margin-top: 140%;
     margin-bottom: 100%;
 }
 :global(.ki-caret-down) {
     width: 0;
     height: 0;
     border-left: 0.35rem solid transparent;
     border-right: 0.35rem solid transparent;
     border-top: 0.35rem solid #232323;
 }
 :global(.ki-w-0) {
     width: 0;
 }
 :global(.ki-w-100) {
     width: 100%;
 }
*/
</style>

<!-- ------------------------------------------------------------ -->
<!-- ------------------------------------------------------------ -->
<div class="ss-container form-control p-0 border-0 {styles.container_class}"
     name="ss_container_{basename}"
     bind:this={containerEl}>

  <button class="form-control {styles.control_class} d-flex"
          name="ss_control_{basename}"
          type="button"
          tabindex="0"
          title="{selectionTitle}"
          bind:this={toggleEl}
          on:blur={handleBlur}
          on:keydown={handleToggleKeydown}
          on:keyup={handleToggleKeyup}
          on:click={handleToggleClick}>

    <span class="ss-no-click ss-selection text-dark d-flex">
      {#each selectionItems as item, index (item.id)}
        {@html index > 0 ? ',&nbsp;' : ''}
        <span class="ss-no-click ss-selected-item {item.item_class}">{item.text}</span>
      {/each}
    </span>
    <span class="ml-auto">
      <i class="{showFetching ? FA_CARET_FETCHING : FA_CARET_DOWN}"></i>
    </span>
  </button>

  <div class="dropdown-menu ss-popup"
       class:show={popupVisible}
       class:ss-popup-top={popupTop}
       bind:this={popupEl}
       on:scroll={handlePopupScroll}>
    {#if typeahead}
        <div class="ss-input-item" tabindex="-1">
          <input class="ss-input form-control {styles.typeahead_class}"
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
             class="dropdown-divider ss-js-blank"
             on:keydown={handleItemKeydown}>
        </div>

      {:else if item.disabled || item.placeholder}
        <div tabindex="-1" class="dropdown-item text-muted ss-js-blank"
             on:keydown={handleItemKeydown}>
          <div class="ss-no-click {item.item_class}">
            {item.display_text || item.text}
          </div>

          {#if item.desc}
            <div class="ss-no-click {styles.item_desc_class}">
              {item.desc}
            </div>
          {/if}
        </div>

      {:else}
        <div tabindex=1
             class="ss-js-item dropdown-item ss-item {item.item_class} {!item.blank && selectionById[item.id] ? styles.selected_item_class : ''}"
             data-id="{item.id}"
             data-action="{item.action || ''}"
             on:blur={handleBlur}
             on:click={handleItemClick}
             on:keydown={handleItemKeydown}
             on:keyup={handleItemKeyup}>

          <div class="ss-no-click">
            {#if multiple}
              <div class="d-inline-block align-top">
                {#if !item.blank}
                  <i class="pr-1 {selectionById[item.id] ? FA_SELECTED : FA_NOT_SELECTED}"></i>
                {/if}
              </div>
            {/if}

            <div class="d-inline-block">
              <div class="ss-no-click {item.item_class}">
                {#if item.blank && multiple}
                  {translate('clear')}
                {:else}
                  {item.text}
                {/if}
              </div>

              {#if item.desc}
                <div class="ss-no-click {styles.item_desc_class}">
                  {item.desc}
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    {/each}

    {#if typeahead && actualCount === 0 && previousFetch && !activeFetch}
      <div tabindex="-1" class="dropdown-item ss-message-item text-muted ss-no-click ss-js-blank">
        {translate('no_results')}
      </div>
    {/if}

    {#if fetchError}
      <div tabindex="-1" class="dropdown-item ss-message-item border-top text-danger ss-no-click ss-js-blank ss-sticky-item">
        {fetchError}
      </div>
    {/if}

    {#if selectionItems.length >= maxItems}
      <div tabindex="-1" class="dropdown-item ss-message-item border-top text-danger ss-no-click ss-js-blank ss-sticky-item">
        {translate('max_limit')}
      </div>
    {/if}
  </div>
</div>
