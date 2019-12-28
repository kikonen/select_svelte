<script>
 import { beforeUpdate } from 'svelte';
 import {onMount} from 'svelte';

 export let real;
 export let fetcher;
 export let remote;
 export let queryMinLen = 0;
 export let delay = 0;
 export let typeahead = false;
 export let styles = {};

 let containerEl;
 let inputEl;
 let toggleEl;
 let popupEl;
 let moreEl;

 let setup = false;
 let setupStyles = {};

 let mounted = false;

 let query = '';

 let fixedItems = [];

 let result = createResult({});
 let displayItems = [];
 let actualCount = 0;
 let tooShort = false;
 let hasMore = false;

 let selectionById = {};
 let selectionItems = [];
 let selectionDropdownItems = [];

 let showFetching = false;
 let fetchingMore = false;
 let fetchError = null;

 let popupVisible = false;

 let activeFetch = null;
 let fetched = false;

 let previousFetch = null;
 let previousQuery = null;

 let multiple = false;

 let downQuery = null;
 let wasDown = false;

 let isSyncToReal = false;


 ////////////////////////////////////////////////////////////
 //

 ////////////////////////////////////////////////////////////
 // select

 function inlineFetcher(offset, query) {
     if (DEBUG) console.log("INLINE_SELECT_FETCH: " + query);

     let promise = new Promise(function(resolve, reject) {
         let items = []
         let pattern = query.toUpperCase().trim();

         let options = real.options;
         for (let i = 0; i < options.length; i++) {
             let item = createItemFromOption(options[i]);
             let match = !item.id ||
                         item.text.toUpperCase().includes(pattern) ||
                         item.desc.toUpperCase().includes(pattern);
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

 function createItemFromOption(el) {
     let ds = el.dataset;
     let item = {
         id: el.value || '',
         text: el.text || '',
     };

     if (ds) {
         if (ds.itemDesc) {
             item.desc = ds.itemDesc;
         }
         if (ds.itemClass) {
             item.itemClass = ds.itemClass;
         } else {
             item.itemClass = setupStyles[item.id === '' ? 'blank_item_class' : 'item_class'];
         }
     }
     return item;
 }

 ////////////////////////////////////////////////////////////
 //
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
         tooShort = false;
         hasMore = false;
         fetched = false;
     }
     fetchingMore = fetchMore;
     fetchError = null;
     showFetching = false;

     let currentFetchingMore = fetchingMore;

     let currentFetch = new Promise(function(resolve, reject) {
         if (currentFetchingMore) {
//             console.debug("MOR hit: " + currentQuery);
             resolve(fetcher(currentFetchOffset, currentQuery, fetchId));
         } else {
             if (currentQuery.length < queryMinLen && !fetchId) {
//                 console.debug("TOO_SHORT fetch: " + currentQuery + ", limit: " + queryMinLen);
                 resolve({
                     items: [],
                     info: {
                         more: false,
                         too_short: true,
                     }
                 });
             } else {
//                 console.debug("TIMER start: " + currentQuery);
                 setTimeout(function() {
                     if (currentFetch === activeFetch) {
//                         console.debug("TIMER hit: " + currentQuery);
                         resolve(fetcher(currentFetchOffset, currentQuery, fetchId));
                     } else {
//                         console.debug("TIMER reject: " + currentQuery);
                         reject("cancel");
                     }
                 }, delay);
             }
         }
     }).then(function(response) {
         if (currentFetch === activeFetch) {
             let responseItems = response.items || [];
             let info = response.info || {};

//             console.debug("APPLY fetch: " + currentQuery + ", isMore: " + currentFetchingMore + ", offset: " + currentFetchOffset + ", resultSize: " + fetchedItems.length + ", oldSize: " + items.length);
//             console.debug(info);

             let fetchedItems = responseItems;
             if (currentFetchingMore) {
                 fetchedItems = result.fetchedItems;
                 responseItems.forEach(function(item) {
                     fetchedItems.push(item);
                 });
             }

             result = createResult({
                 fetchedItems: fetchedItems,
                 fixedItems: fixedItems,
                 fetchedId: fetchId,
                 more: info.more,
                 tooShort: info.too_short === true,
             });
             displayItems = result.displayItems;
             actualCount = result.actualCount;
             tooShort = result.tooShort;
             hasMore = result.more;

             if (fetchId) {
                 previousQuery = null;
             } else {
                 previousQuery = currentQuery;
             }
             previousFetch = currentFetch;
             activeFetch = null;
             fetched = true;
             fetchingMore = false;
             showFetching = false;
//         } else {
//             console.debug("ABORT fetch: " + currentQuery);

             setTimeout(function() {
                 fetchMoreIfneeded();
             });
         }
     }).catch(function(err) {
         if (currentFetch === activeFetch) {
             console.error(err);

             fetchError = err;

             let result = createResult({
                 fixedItems: fixedItems
             });
             displayItems = result.displayItems;
             actualCount = result.actualCount;
             tooShort = result.tooShort;
             hasMore = result.more;

             previousQuery = null;
             previousFetch = currentFetch;
             activeFetch = null;
             fetched = false;
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
         fetched = false;
         previousQuery = null;
     }
 }


 function fetchMoreIfneeded() {
     if (hasMore && !fetchingMore && popupVisible) {
         if (popupEl.scrollTop + popupEl.clientHeight >= popupEl.scrollHeight - moreEl.clientHeight * 2 - 2) {
             fetchItems(true);
         }
     }
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
     }
 }

 function closePopup(focusToggle) {
     selectionDropdownItems = selectionItems;

     popupVisible = false;
     if (focusToggle) {
         toggleEl.focus();
     }
 }

 function selectItemImpl(id) {
     id = id.toString();

/*
     if (remote) {
         syncToReal();
     }
*/

     let item = result.byId[id] || selectionById[id];

     if (!item) {
         console.error("MISSING item=" + id);
         return;
     }

     let blankItem = result.blankItem;
     let byId = selectionById;

     if (multiple) {
         if (item.id) {
             if (byId[item.id]) {
                 delete byId[item.id];

                 if (!blankItem) {
                     blankItem = BLANK_ITEM;
                 }
             } else {
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

     if (!multiple) {
         closePopup(containsElement(document.activeElement));
     }

     syncToReal();
     real.dispatchEvent(new CustomEvent('select-select', { detail: selectionItems }));
 }

 export function selectItem(id) {
     return fetchItems(false, id).then(function(response) {
         selectItemImpl(id);
     });
 }

 function selectElement(el) {
     selectItemImpl(el.dataset.id);

     if (el.dataset.selected) {
         selectionDropdownItems = selectionDropdownItems;
//         if (!focusNextItem(el)) {
//             focusPreviousItem(el);
//         }
     }
 }

 function containsElement(el) {
     return containerEl.contains(el) || popupEl.contains(el);
 }

 ////////////////////////////////////////////////////////////
 // HANDLERS
 //
 $: {
     if (mounted) {
         syncToReal();
     }
 }

 function syncFromReal() {
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
             item = createItemFromOption(el);
         }
         byId[item.id] = item;
     }

     selectionById = byId;
     selectionItems = Object.values(byId).sort(function(a, b) {
         return a.text.localeCompare(b.text);
     });
 }

 function syncToReal() {
     let changed = false;

     // Insert missing values
     // NOTE KI all existing values are *assumed* to be in sync data-attr wise
     if (remote) {
         selectionItems.forEach(function(item) {
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
         let curr = !!selectionById[el.value];
         if (el.selected !== curr) {
             changed = true;
         }
         el.selected = curr;
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

 function setupRemote() {
     let fixedOptions = real.querySelectorAll('option[data-select-fixed]');
     let collectedItems = [];
     fixedOptions.forEach(function(el) {
         let ds = el.dataset;
         let item = {
             id: el.value,
             text: el.text,
         };
         if (ds.desc) {
             item.desc = ds.itemDesc;
         }
         collectedItems.push(item);
     });
     fixedItems = collectedItems;
 }

 function setupComponent() {
     real.classList.add('d-none');
     multiple = real.multiple;

     if (remote) {
         setupRemote();
     } else {
         fetcher = inlineFetcher
     }

     Object.assign(setupStyles, STYLE_DEFAULTS);
     Object.assign(setupStyles, styles);
 }

 beforeUpdate(function() {
     if (!setup) {
         setupComponent();
         setup = true;
     }
 });

 onMount(function() {
     // Initial selection
     syncFromReal();

     real.addEventListener('change', function() {
         if (!isSyncToReal) {
             syncFromReal();
             if (DEBUG) console.log("FROM_REAL", selectionItems);
         }
     });

     mounted = true;
 });

 ////////////////////////////////////////////////////////////
 //
 let toggleKeydownHandlers = {
     base: function(event) {
         if (typeahead && popupVisible) {
             inputEl.focus();
         }
     },
     ArrowDown: function(event) {
         openPopup();
         fetchItems();

         if (typeahead) {
             inputEl.focus();
         } else {
             let next = popupEl.querySelectorAll('.ki-js-item')[0];
             while (next && next.classList.contains('ki-js-blank')) {
                 next = next.nextElementSibling;
             }
             focusItem(next);
         }
         event.preventDefault();
     },
     ArrowUp: nop,
     Enter: function(event) {
         openPopup();
         fetchItems(false);
         event.preventDefault();
     },
     Space: function(event) {
         openPopup();
         fetchItems(false);
         event.preventDefault();
     },
     Escape: function(event) {
         cancelFetch();
         clearQuery();
         closePopup(false);
     },
     Tab: nop,
 };

 let toggleKeyupHandlers = {
     base: nop,
     Tab: nop,
 }

 let inputKeypressHandlers = {
     base: function(event) {
     },
 };

 let inputKeydownHandlers = {
     base: function(event) {
         wasDown = true;
     },
     ArrowDown: function(event) {
         let next = popupEl.querySelectorAll('.ki-js-item')[0];
         while (next && next.classList.contains('ki-js-blank')) {
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
         if (wasDown) {
             fetchItems();
         }
     },
     Enter: nop,
     Escape: nop,
     Tab: nop,
     // skip "meta" keys from triggering search
     ArrowDown: nop,
     ArrowUp: nop,
     ArrowLeft: nop,
     ArrowRight: nop,
     PageDown: nop,
     PageUp: nop,
     Home: nop,
     End: nop,
     // disallow modifier keys to trigger search
     Control: nop,
     Shift: nop,
     AltGraph: nop,
     Meta: nop,
     ContextMenu: nop,
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
         while (next && next.classList.contains('ki-js-blank')) {
             next = next.previousElementSibling;
         }
         if (next && !next.classList.contains('ki-js-item')) {
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
         while (next && next.classList.contains('ki-js-blank')) {
             next = next.nextElementSibling;
         }

         if (next && !next.classList.contains('ki-js-item')) {
             next = null;
         }
     }

     focusItem(next);

     return next;
 }

 let itemKeydownHandlers = {
     base: function(event) {
         if (typeahead) {
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
     // allow "meta" keys to navigate in items
     PageUp: nop,
     PageDown: nop,
     Home: nop,
     End: nop,
     Tab: function(event) {
         toggleEl.focus();
         event.preventDefault();
     },
     // disallow modifier keys to trigger search
     Control: nop,
     Shift: nop,
     AltGraph: nop,
     Meta: nop,
     ContextMenu: nop,
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
             next = popupEl.querySelector('.ki-js-item:first-child');
         } else {
             if (!next.classList.contains('ki-js-item')) {
                 next = popupEl.querySelector('.ki-js-item:first-child');
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
             next = popupEl.querySelector('.ki-js-item:last-child');
         } else {
             if (!next.classList.contains('ki-js-item')) {
                 next = popupEl.querySelector('.ki-js-item:last-child');
             }
         }
         focusItem(next);
         event.preventDefault();
     },
     Home: function(event) {
         let next = popupEl.querySelector('.ki-js-item:first-child');
         focusItem(next);
         event.preventDefault();
     },
     End: function(event) {
         let next = popupEl.querySelector('.ki-js-item:last-child');
         focusItem(next);
         event.preventDefault();
     },
 }


 ////////////////////////////////////////////////////////////
 //
 function handleEvent(code, handlers, event) {
     if (DEBUG) console.debug(event);
     (handlers[code] || handlers.base)(event);
 }

 function handleBlur(event) {
     if (event.sourceCapabilities && !containsElement(event.relatedTarget)) {
         if (DEBUG) console.log("BLUR", event);

         cancelFetch();

         clearQuery();
         closePopup(false);

         // TODO KI *WHY* this redundant sync was done?!?
//         syncFromReal();
     } else {
         if (DEBUG) console.log("IGNORE_BLUR", event);
     }
 }

 function handleInputBlur(event) {
     handleBlur(event);
 }

 function handleInputKeypress(event) {
     handleEvent(event.code, inputKeypressHandlers, event);
 }

 function handleInputKeydown(event) {
     handleEvent(event.code, inputKeydownHandlers, event);
 }

 function handleInputKeyup(event) {
     handleEvent(event.code, inputKeyupHandlers, event);
 }

 function handleToggleKeydown(event) {
     handleEvent(event.code, toggleKeydownHandlers, event);
 }

 function handleToggleKeyup(event) {
     handleEvent(event.code, toggleKeyupHandlers, event);
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
     handleEvent(event.code, itemKeydownHandlers, event);
 }

 function handleItemKeyup(event) {
     handleEvent(event.code, itemKeyupHandlers, event);
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

<script context="module">
 const DEBUG = false;

 const I18N_DEFAULTS = {
     clear: 'Clear',
     fetching: 'Searching..',
     no_results: 'No results',
     too_short: 'Too short',
     has_more: 'More...',
     fetching_more: 'Searching more...',
 };

 const STYLE_DEFAULTS = {
     container_class: '',
     item_class: '',
     item_desc_class: 'text-muted',
     blank_item_class: 'text-muted',
     typeahead_class: '',
     control_class: '',
 };

 const FETCH_INDICATOR_DELAY = 150;
 const CARET_DOWN = 'fas fa-caret-down';
 const CARET_FETCHING = 'far fa-hourglass';

 const BLANK_ITEM = {
     id: '',
     text: ''
 };

 const META_KEYS = {
     Control: true,
     Shift: true,
     Alt: true,
     AltGraph: true,
     Meta: true,
     ContextMenu: true,
     PrintScreen: true,
     Pause: true,
     CapsLock: true,
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
 }

 export const config = {
     translations: I18N_DEFAULTS
 };

 function nop() {};

 function translate(key) {
     return config.translations[key] || I18N_DEFAULTS[key];
 }

 function hasModifier(event) {
     return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
 }

 function isValidKey(event) {
     return !(META_KEYS[event.key] || META_KEYS[event.code])
 }

 function createOptionFromItem(item) {
     let el = document.createElement('option');
     el.setAttribute('value', item.id);
     if (item.desc) {
         el.setAttribute('data-item-desc', item.desc);
     }
     if (item.itemClass) {
         el.setAttribute('data-item-class', item.itemClass);
     }
     el.textContent = item.text;
     return el;
 }

 function createResult(data) {
     let items;
     let byId = {};
     let off = 0;
     let act = 0;

     if (data.fixedItems && data.fetchedItems) {
         items = [];
         if (data.fixedItems) {
             data.fixedItems.forEach(function(item) {
                 items.push(item);
             });
         }

         if (data.fetchedItems) {
             if (items.length > 0) {
                 items.push({ separator: true });
             }
             let wasClear = false;
             data.fetchedItems.forEach(function(item) {
                 if (wasClear) {
                     items.push({ separator: true });
                 }
                 items.push(item);
                 wasClear = !item.id;
             });
         }
     } else {
         items = data.fetchedItems || data.fixedItems || [];
     }

     items.forEach(function(item) {
         byId[item.id] = item;
     });

     let counts = calculateCounts(data.fetchedItems || []);
     let more = data.more === true && counts.offsetCount > 0 && !data.fetchedId;
     let tooShort = data.tooShort === true;

     return {
         blankItem: byId[''] || null,
         byId: byId,
         displayItems: items,
         fetchedItems: data.fetchedItems,
         offsetCount: counts.offsetCount,
         actualCount: counts.actualCount,
         more: more,
         tooShort: tooShort,
     };
 }

 function calculateCounts(items) {
     let act = 0;
     let off = 0;

     items.forEach(function(item) {
         if (item.id) {
             item.id = item.id.toString();
         }

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

<!-- ------------------------------------------------------------ -->
<!-- ------------------------------------------------------------ -->
<style>
 :global(.ss-container) {
     position: relative;
 }
 :global(.ss-selection) {
     width: 100%;
     height: 100%;
 }
 :global(.ss-selected-item) {
     white-space: nowrap;
     overflow: hidden;
     word-break: break-all;
     text-overflow: ellipsis;
 }
 :global(.ss-popup) {
     padding-top: 0;
     max-height: 50vh;
     max-width: 90vw;
     overflow-y: auto;
 }
 :global(.ss-item) {
     padding-left: 0.5rem;
     padding-right: 0.5rem;
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
<div class="ss-container form-control p-0 border-0 {setupStyles.container_class}"
     bind:this={containerEl}>

  <button class="form-control {setupStyles.control_class} d-flex"
          type="button"
          tabindex="0"
          bind:this={toggleEl}
          on:blur={handleBlur}
          on:keydown={handleToggleKeydown}
          on:keyup={handleToggleKeyup}
          on:click={handleToggleClick}>

    <span class="ss-no-click ss-selection text-dark d-flex">
      {#each selectionItems as item, index (item.id)}
        <span class="ss-no-click ss-selected-item {item.itemClass}">{index > 0 ? ', ' : ''}{item.text}</span>
      {/each}
      <span class="ml-auto">
        <i class="text-dark {showFetching ? CARET_FETCHING : CARET_DOWN}"></i>
      </span>
    </span>
  </button>

  <div class="dropdown-menu ss-popup {popupVisible ? 'show' : ''}"
       bind:this={popupEl}
       on:scroll={handlePopupScroll}>
    {#if fetchError}
      <div tabindex="-1" class="dropdown-item text-danger ss-item">
        {fetchError}
      </div>
    {/if}

    {#if typeahead}
        <div class="ss-input-item" tabindex="-1">
          <input class="ss-input form-control {setupStyles.typeahead_class}"
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

      {#each selectionDropdownItems as item, index (item.id)}
        {#if item.id}
          <div tabindex=1
               class="ki-js-item dropdown-item ss-item"
               data-id="{item.id}"
               data-index="{index}"
               data-selected="true"
               on:blur={handleBlur}
               on:click={handleItemClick}
               on:keydown={handleItemKeydown}
               on:keyup={handleItemKeyup}>

            <div class="ss-no-click">
              {#if multiple}
                <div class="d-inline-block align-top">
                  {#if item.id}
                    <i class="far {selectionById[item.id] ? 'fa-check-square' : 'fa-square'}"></i>
                  {/if}
                </div>
              {/if}

              <div class="d-inline-block">
                <div class="ss-no-click {item.itemClass}">
                  {#if item.id}
                    {item.text}
                  {:else}
                    {translate('clear')}
                  {/if}
                </div>

                {#if item.desc}
                  <div class="ss-no-click {setupStyles.item_desc_class}">
                    {item.desc}
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/if}
      {/each}

      {#if selectionDropdownItems.length > 1 || (selectionDropdownItems.length == 1 && selectionDropdownItems[0].id)}
        <div tabindex="-1"
             class="dropdown-divider ki-js-blank"
             on:keydown={handleItemKeydown}>
        </div>
      {/if}
    {/if}

    {#each displayItems as item (item.id)}
      {#if item.separator}
        <div tabindex="-1"
             class="dropdown-divider ki-js-blank"
             on:keydown={handleItemKeydown}>
        </div>

      {:else if item.disabled || item.placeholder}
        <div tabindex="-1" class="dropdown-item text-muted ki-js-blank"
             on:keydown={handleItemKeydown}>
          <div class="ss-no-click {item.itemClass}">
            {item.display_text || item.text}
          </div>

          {#if item.desc}
            <div class="ss-no-click {setupStyles.item_desc_class}">
              {item.desc}
            </div>
          {/if}
        </div>

      {:else}
        <div tabindex=1
             class="ki-js-item dropdown-item ss-item {item.itemClass} {selectionById[item.id] ? 'alert-primary' : ''}"
             data-id="{item.id}"
             on:blur={handleBlur}
             on:click={handleItemClick}
             on:keydown={handleItemKeydown}
             on:keyup={handleItemKeyup}>

          <div class="ss-no-click">
            {#if multiple}
              <div class="d-inline-block align-top">
                {#if item.id}
                  <i class="far {selectionById[item.id] ? 'fa-check-square' : 'fa-square'}"></i>
                {/if}
              </div>
            {/if}

            <div class="d-inline-block">
              <div class="ss-no-click {item.itemClass}">
                {#if item.id}
                  {item.text}
                {:else}
                  {translate('clear')}
                {/if}
              </div>

              {#if item.desc}
                <div class="ss-no-click {setupStyles.item_desc_class}">
                  {item.desc}
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    {/each}

    {#if hasMore}
      <div tabindex="-1"
           class="dropdown-item text-muted"
           bind:this={moreEl}>
        {translate('has_more')}
      </div>
    {/if}
    {#if actualCount === 0}
      <div tabindex="-1" class="dropdown-item text-muted ss-item">
        {#if tooShort }
          {translate('too_short')}
        {:else}
          {translate('no_results')}
        {/if}
      </div>
    {/if}
  </div>
</div>
