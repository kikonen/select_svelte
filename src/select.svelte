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

 const BLANK_ID = '';

 const FIXED_SORT_KEY = '_';

 const FETCH_INDICATOR_DELAY = 150;

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

 /**
  * NOTE 0 and "0" are non blank ids
  */
 function isBlankId(id) {
     return id !== 0 && id !== '0' && (id == null || id == BLANK_ID);
 }

 /**
  * Normalize id value
  */
 function normalizeId(id) {
     return isBlankId(id) ? BLANK_ID : id.toString();
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

 function createItemFromOption(el, styles, baseHref) {
     let ds = el.dataset;
     let item = {
         id: normalizeId(el.value),
         text: el.text || '',
     };

     if (ds) {
         item.sort_key = ds.sortKey || null;
         if (ds.itemSeparator !== undefined) {
             item.separator = true;
         }

         if (ds.itemSummary != null) {
             item.summary = ds.itemSummary;
         }

         item.desc = ds.itemDesc || null;
         item.action = ds.itemAction || null;

         item.item_class = ds.itemClass || null;
         item.item_text_class = ds.itemTextClass || null;
         item.item_desc_class = ds.itemDescClass || null;

         item.href = ds.itemHref || null;

         item.data = {};
         Object.keys(ds).forEach(function(key) {
             item.data[toUnderscore(key)] = ds[key];
         });
     }

     if (item.sort_key == null) {
         item.sort_key = item.text;
     }

     if (!item.separator) {
         if (isBlankId(item.id)) {
             item.blank = true;
         } else {
             if (!item.action && !item.href && baseHref) {
                 item.href = baseHref.replace(/:id/, item.id);
             }
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
     if (item.item_text_class) {
         el.setAttribute('data-item-text-class', item.item_class);
     }
     if (item.item_desc_class) {
         el.setAttribute('data-item-desc-class', item.item_class);
     }
     if (item.action) {
         el.setAttribute('data-item-action', item.action);
     }
     if (item.summary) {
         el.setAttribute('data-item-summary', item.desc);
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

     let query = (data.query || '').trim();
     let fixedItems = data.fixedItems || [];
     let fetchedItems = data.fetchedItems || [];
     let selectionItems = data.selectionItems || [];

     fixedItems.forEach(function(item) {
         if (byId[item.id]) {
             console.warn("DUPLICATE: fixed", item);
             return;
         }

         items.push(item);
         if (!item.separator) {
             byId[item.id] = item;
         }
     });

     let filteredSelection = [];
     let filteredFetched = [];

     if (data.multiple && !query) {
         selectionItems.forEach(function(item) {
             if (byId[item.id]) {
                 // NOTE KI "placeholder" is pushed into fixed items; don't complain about it
                 if (!item.blank) {
                     console.warn("DUPLICATE: selected", item);
                 }
                 return;
             }

             filteredSelection.push(item);
             if (!item.separator) {
                 byId[item.id] = item;
             }
         });
     }

     fetchedItems.forEach(function(item) {
         if (byId[item.id]) {
             console.warn("DUPLICATE: fetched", item);
             return;
         }

         filteredFetched.push(item);
         if (!item.separator) {
             byId[item.id] = item;
         }
     });

     if (data.typeahead && items.length && filteredSelection.length && filteredFetched.length) {
         items.push({ id: 'fixed_sep', separator: true })
     }

     filteredSelection.forEach(function(item) {
         items.push(item);
     });

     if (filteredSelection.length && filteredFetched.length) {
         items.push({ id: 'selection_sep', separator: true })
     }

     filteredFetched.forEach(function(item) {
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
         displayItems: items,
         dirty: false
     };
 };

 function createResult(data) {
     let fetchedItems = data.fetchedItems || [];

     fetchedItems.forEach(function(item) {
         item.id = normalizeId(item.id);

         if (isBlankId(item.id)) {
             item.blank = true;
         }

         if (item.text == null) {
             item.text = '';
         }

         if (item.sort_key == null) {
             item.sort_key = item.text;
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
         } else if (item.blank) {
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
 import {afterUpdate} from 'svelte';
 import {onMount} from 'svelte';

 export let real;
 export let config = {};

 let containerEl;
 let inputEl;
 let toggleEl;
 let popupEl;

 const mutationObserver = new MutationObserver(handleMutation);

 let resizeObserver;

 let setupDone = false;
 let translations = {};
 let styles = {};

 let popupFixed = false;

 let fetcher = inlineFetcher;
 let remote = false;
 let maxItems = 100;
 let typeahead = false;
 let summaryLen = 2;
 let summaryWrap = false;
 let noCache = false;
 let placeholderItem = {
     id: BLANK_ID,
     text: '',
     blank: true
 };
 let baseHref = null;

 let mounted = false;
 let containerId = null;
 let containerName = null;

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
     if (noCache) {
         previousQuery = null;
     }
 }

 function openPopup() {
     if (!popupVisible) {
         popupVisible = true;
         let w = containerEl.offsetWidth;
         popupEl.style.minWidth = w + "px";

         updatePopupPosition();
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
         if (!item.blank) {
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
         let id = normalizeId(el.value);
         let item = oldById[id];
         if (!item) {
             item = createItemFromOption(el, styles, baseHref);
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
         let id = normalizeId(el.value);
         let selected = !!selectionById[id];
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

         // NOTE KI pick "blank" and "fixed" items
         if (isBlankId(el.value) || el.dataset.itemFixed != null) {
             let item = createItemFromOption(el, styles, baseHref);
             item.sort_key = FIXED_SORT_KEY + item.sort_key;
             item.fixed = true;
             byId[item.id] = item;
             items.push(item);
         }
     }

     let blankItem = byId[BLANK_ID];
     if (blankItem) {
         blankItem.blank = true;
     }

     fixedItems = items;
     fixedById = byId;
 }

 function updateDisplay() {
     if (DEBUG) console.log("UPDATE_DISPLAY: dirty=" + display.dirty, display);
     if (!display.dirty) {
         return;
     }

     display = createDisplay({
         query: query,
         typeahead: typeahead,
         multiple: multiple,
         fixedItems: fixedItems,
         fetchedItems: result.fetchedItems,
         selectionItems: selectionItems,
     });
     displayItems = display.displayItems;
 }

 function appendFetchedToDisplay(fetchedItems) {
     let byId = display.byId;
     let items = display.displayItems;

     fetchedItems.forEach(function(item) {
         if (byId[item.id]) {
             console.warn("DUPLICATE: fetched-append", item);
             return;
         }

         items.push(item);
         if (!item.separator) {
             byId[item.id] = item;
         }
     });
     displayItems = display.displayItems;
 }

 function updateSelection(byId) {
     let items = Object.values(byId);
     if (items.length === 0) {
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
     display.dirty = true;
 }

 function reload() {
     if (isSyncToReal) {
         return;
     }
     updateFixedItems();
     syncFromRealSelection();
     result = createResult({});
     display.dirty = true;
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
         let pattern = query.toUpperCase().trim();

         let matchedItems = []

         let options = real.options;
         for (let i = 0; i < options.length; i++) {
             let item = createItemFromOption(options[i], styles, baseHref);
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
                 matchedItems.push(item);
             }
         }

         let wasSeparator = true;
         let lastSeparator = null;

         let items = []
         matchedItems.forEach(function(item) {
             if (item.separator) {
                 lastSeparator = item;
             } else {
                 if (lastSeparator && !wasSeparator) {
                     items.push(lastSeparator);
                     lastSeparator = null;
                 }
                 items.push(item);
                 wasSeparator = false;
             }
         });

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
                 appendFetchedToDisplay(responseItems)
             } else {
                 display.dirty = true;
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

             display.dirty = true;
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

         showFetching = false;
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

 afterUpdate(function() {
     if (popupFixed && !resizeObserver) {
         resizeObserver = new ResizeObserver(handleResize);
         resizeObserver.observe(containerEl, {});
     }
     updatePopupPosition();
 });

 function setupComponent() {
     real.classList.add('ss-select-hidden');
     real.setAttribute('tabindex', '-1');
     multiple = real.multiple;

     let ds = real.dataset;

     containerId = real.id ? `ss_container_${real.id}` : null;
     containerName = real.name ? `ss_container_${real.name}` : null;

     if (config.remote) {
         remote = true;
         fetcher = config.fetcher;
     }

     typeahead = ds.ssTypeahead !== undefined ? true : typeahead;
     maxItems = ds.ssMaxItems !== undefined ? parseInt(ds.ssMaxItems, 10) : maxItems;
     summaryLen = ds.ssSummaryLen !== undefined ? parseInt(ds.ssSummaryLen, 10) : summaryLen;
     summaryWrap = ds.ssSummaryWrap !== undefined ? true : summaryWrap;
     baseHref = ds.ssBaseHref != undefined ? ds.ssBaseHref : baseHref;
     noCache = ds.ssNoCache !== undefined ? true : noCache;
     popupFixed = ds.ssPopupFixed !== undefined ? true : popupFixed;

     typeahead = config.typeahead !== undefined ? config.typeahead : typeahead
     maxItems = config.maxItems || maxItems;
     summaryLen = config.summaryLen || summaryLen;
     summaryWrap = config.summaryWrap !== undefined ? config.summaryWrap : summaryWrap;

     baseHref = config.baseHref || baseHref;
     noCache = config.noCache !== undefined ? config.noCache : noCache;
     popupFixed = config.popupFixed !== undefined ? config.popupFixed : popupFixed;

     Object.assign(translations, I18N_DEFAULTS);
     if (config.translations) {
         Object.assign(translations, config.translations);
     }

     Object.assign(styles, STYLE_DEFAULTS);
     if (config.styles) {
         Object.assign(styles, config.styles);
     }

     maxItems = config.maxItems || maxItems;
     placeholderItem.text = config.placeholder || '';

     if (jQuery.tooltip) {
         jQuery(toggleEl).tooltip();
     }

     mutationObserver.observe(real, MUTATIONS);

     updateFixedItems();
     display.dirty = true;
     updateDisplay();
 }

 function handleMutation(mutationsList, observer) {
     for (let mutation of mutationsList) {
         if (mutation.type === 'childList') {
             reload();
         }
     }
 }

 function handleResize(resizeList, observer) {
     updatePopupPosition();
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
     'focus': function(event) {
         toggleEl.focus();
     },
 }

 function findFirstItem() {
     return multiple ? findFirstDynamic() : findFirstSimple();
 }

 function findFirstSimple() {
     let selectedId = selectionItems[0].id;
     return popupEl.querySelector(`.ss-js-item[data-id="${selectedId}"`);
 }

 function findFirstDynamic() {
     let next = popupEl.querySelectorAll('.ss-js-item')[0];
     while (next && next.classList.contains('ss-js-dead')) {
         next = next.nextElementSibling;
     }
 }

 function updatePopupPosition() {
     if (!popupVisible) {
         return;
     }

     let bounds = containerEl.getBoundingClientRect();

     let middleY = window.innerHeight / 2;
     let middleX = window.innerWidth / 2;

     popupTop = bounds.y > middleY;
     popupLeft = bounds.x + bounds.width > middleX;

     if (popupFixed) {
         let popupBounds = popupEl.getBoundingClientRect();

         if (popupTop) {
             popupEl.style.top = `${bounds.y - popupBounds.height}px`;
         } else {
             popupEl.style.top = `${bounds.y + bounds.height}px`;
         }
         if (popupLeft) {
             popupEl.style.left = `${bounds.x + bounds.width - popupBounds.width}px`;
         } else {
             popupEl.style.left = `${bounds.x}px`;
         }
     }
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
         fetchItems().then(function() {
             let next = findFirstItem();
             if (next) {
                 focusItem(next);
             } else if (typeahead) {
                 inputEl.focus();
             }
         });
         event.preventDefault();
     },
     ArrowUp: function(event) {
         openPopup();
         fetchItems().then(function() {
             focusItem(findFirstItem());
         });
         event.preventDefault();
     },
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
             fetchItems(false).then(function() {
                 focusItem(findFirstItem());
             });
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
             fetchItems(false).then(function() {
                 focusItem(findFirstItem());
             });
         }
         event.preventDefault();
     },
     Escape: function(event) {
         cancelFetch();
         clearQuery();
         closePopup(false);
     },
     Delete: function(event) {
         selectItem(BLANK_ID);
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
     Enter: function(event) {
         event.preventDefault();
     },
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
     PageUp: function(event) {
//         blockScrollUpIfNeeded(event);
         event.preventDefault();
     },
     PageDown: function(event) {
//         blockScrollDownIfNeeded(event);
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

 function focusPageUp(event) {
     let scrollLeft = document.body.scrollLeft;
     let scrollTop = document.body.scrollTop;

     let popupRect = popupEl.getBoundingClientRect();

     let x = scrollLeft + popupRect.left + 10;
     let y;

     if (typeahead) {
         let inputRect = inputEl.getBoundingClientRect();
         y = scrollTop + inputRect.bottom + 10;
     } else {
         y = scrollTop + popupRect.top + 10;
     }

     let next = document.elementFromPoint(x, y);
     if (!next) {
         let nodes = popupEl.querySelectorAll('.ss-js-item');
         let next = nodes.length ? nodes[0] : null;
     } else {
         if (next.classList.contains('ss-item-link')) {
             next = next.closest('.ss-js-item');
         }

         if (!next.classList.contains('ss-js-item')) {
             let nodes = popupEl.querySelectorAll('.ss-js-item');
             let next = nodes.length ? nodes[0] : null;
         }
     }
     focusItem(next);
     event.preventDefault();
 }

 function focusPageDown(event) {
     let scrollLeft = document.body.scrollLeft;
     let scrollTop = document.body.scrollTop;

     let popupRect = popupEl.getBoundingClientRect();

     let x = scrollLeft + popupRect.left + 10;
     let y = scrollTop + popupRect.bottom - 10;

     let next = document.elementFromPoint(x, y);
     if (!next) {
         let nodes = popupEl.querySelectorAll('.ss-js-item');
         let next = nodes.length ? nodes[nodes.length -1] : null;
     } else {
         if (next.classList.contains('ss-item-link')) {
             next = next.closest('.ss-js-item');
         }

         if (!next.classList.contains('ss-js-item')) {
             let nodes = popupEl.querySelectorAll('.ss-js-item');
             let next = nodes.length ? nodes[nodes.length - 1] : null;
         }
     }
     focusItem(next);
     event.preventDefault();
 }

 function blockScrollUpIfNeeded(event) {
     if (popupEl.scrollTop === 0) {
         event.preventDefault();
     }
 }

 function blockScrollDownIfNeeded(event) {
     if (fetchingMore) {
         event.preventDefault();
         return;
     }

     let popupRect = popupEl.getBoundingClientRect();

     if (popupEl.scrollTop + popupRect.height >= popupEl.scrollHeight) {
         event.preventDefault();
     }
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
             focusNextItem(event.target);
         }
         event.preventDefault();
     },
     ArrowUp: function(event) {
         focusPreviousItem(event.target);
         event.preventDefault();
     },
     PageUp: function(event) {
         blockScrollUpIfNeeded(event);
     },
     PageDown: function(event) {
         blockScrollDownIfNeeded(event);
     },
     Home: function(event) {
         blockScrollUpIfNeeded(event);
     },
     End: function(event) {
         blockScrollDownIfNeeded(event);
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
         focusPageUp(event);
     },
     PageDown: function(event) {
         focusPageDown(event);
     },
     Home: function(event) {
         let nodes = popupEl.querySelectorAll('.ss-js-item');
         let next = nodes.length ? nodes[0] : null;
         focusItem(next);
         event.preventDefault();
     },
     End: function(event) {
         let nodes = popupEl.querySelectorAll('.ss-js-item');
         let next = nodes.length ? nodes[nodes.length - 1] : null;
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
     if (/*event.sourceCapabilities &&*/ !containsElement(event.relatedTarget)) {
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
             fetchItems(false).then(function() {
                 focusItem(findFirstItem());
             });
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
         }
     }
 }

 function handleToggleLinkClick(event) {
     toggleEl.focus();
     if (!hasModifier(event)) {
         event.preventDefault();
     }
 }

 function handleItemLinkClick(event) {
     let el = event.target.closest('.ss-item');
     el.focus();
     if (!hasModifier(event)) {
         event.preventDefault();
         event.stopPropagation();
         if (event.button === 0) {
             if (!hasModifier(event)) {
                 selectElement(el)
             }
         }
     } else {
         // activate link
     }
 }

 function handlePopupScroll(event) {
     fetchMoreIfneeded();
 }

 function handleWindowScroll(event) {
     updatePopupPosition();
 }
</script>

<!-- ------------------------------------------------------------ -->
<!-- ------------------------------------------------------------ -->
<style>
</style>

<!-- ------------------------------------------------------------ -->
<!-- ------------------------------------------------------------ -->
<svelte:window on:scroll={handleWindowScroll}/>
<div class="form-control ss-container {styles.container_class || ''}"
     id={containerId}
     name={containerName}
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

          {#if item.href}
            <a class="ss-item-link" href="{item.href}" target="_blank"
               tabindex="-1"
               on:click={handleToggleLinkClick}>
              {item.summary == null ? item.text : item.summary}
            </a>
          {:else}
            {item.summary == null ? item.text : item.summary}
          {/if}
        </span>
      {/each}
    </span>
    <span class="ss-caret {showFetching ? FA_CARET_FETCHING : FA_CARET_DOWN}">
    </span>
  </button>

  <div class="dropdown-menu ss-popup"
       class:show={popupVisible}
       class:ss-popup-fixed={popupFixed}
       class:ss-popup-top={popupTop && !popupFixed}
       class:ss-popup-left={popupLeft && !popupFixed}
       class:ss-popup-fixed-top={popupTop && popupFixed}
       class:ss-popup-fixed-left={popupLeft && popupFixed}
       bind:this={popupEl}
       tabindex="-1"
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
          <div class="ss-item-text {item.item_class || ''}">
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
             data-action="{item.action}"
             on:blur={handleBlur}
             on:click={handleItemClick}
             on:keydown={handleItemKeydown}
             on:keyup={handleItemKeyup}>

          <div class="ss-no-click">
            {#if multiple && !item.blank && !item.action}
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
                {#if item.href}
                  <a class="ss-item-link" href="{item.href}"
                     tabindex="-1"
                     on:click={handleItemLinkClick}>
                    {item.text}
                  </a>
                {:else}
                  <div class="ss-item-text {item.item_text_class || ''}">
                    {item.text}
                  </div>
                {/if}

                {#if item.desc}
                  <div class="ss-item-desc {item.item_desc_class || ''}">
                    {item.desc}
                  </div>
                {/if}
              {/if}
            </div>
          </div>
        </div>
      {/if}
    {/each}

    {#if fetchError}
      <div tabindex="-1" class="dropdown-item border-top text-danger ss-message-item ss-sticky-item ss-js-dead">
        {fetchError}
      </div>
    {:else if typeahead && actualCount === 0 && previousFetch && !activeFetch}
      <div tabindex="-1" class="dropdown-item ss-message-item ss-item-muted ss-js-dead">
        {translate('no_results')}
      </div>
    {/if}

    {#if selectionItems.length >= maxItems}
      <div tabindex="-1" class="dropdown-item border-top text-danger ss-message-item ss-sticky-item ss-js-dead">
        {translate('max_limit')} ({maxItems})
      </div>
    {/if}
  </div>
</div>
