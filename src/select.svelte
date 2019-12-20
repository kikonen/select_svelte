<script>
 import {onMount} from 'svelte';

 export let real;
 export let fetcher;
 export let remote;
 export let queryMinLen = 0;
 export let delay = 0;
 export let extraClass = '';
 export let typeahead = false;

 let query = '';

 let container;
 let input;
 let selectionDisplay;
 let toggle;
 let popup;
 let more;

 let mounted = false;

 let fixedItems = [];
 let displayItems = [];
 let itemMap = {};

 let items = [];
 let offsetCount = 0;
 let actualCount = 0;

 let selectedMap = {};
 let selectedItems = [];

 let message = null;
 let messageClass = null;

 let showFetching = false;
 let hasMore = false;
 let tooShort = false;
 let fetchingMore = false;
 let fetchError = null;

 let inputVisible = false;
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
     console.log("INLINE_SELECT_FETCH: " + query);

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

 ////////////////////////////////////////////////////////////
 //
 function fetchItems(more, fetchId) {
     let currentQuery;
     if (fetchId) {
         currentQuery = '';
     } else {
         currentQuery = query.trim();
         if (currentQuery.length > 0) {
             currentQuery = query;
         }
     }

     if (!more && !fetchingMore && currentQuery === previousQuery && !fetchId) {
         return activeFetch || previousFetch;
     }

//     console.debug("START fetch: " + currentQuery);

     cancelFetch();

     let fetchOffset = 0;

     if (more) {
         fetchOffset = offsetCount;
     } else {
         items = [];
         offsetCount = 0;
         actualCount = 0;
         hasMore = false;
         fetched = false;
     }
     fetchingMore = more;
     fetchError = null;
     showFetching = false;

     let currentFetchOffset = fetchOffset;
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
             let fetchedItems = response.items || [];
             let info = response.info || {};

//             console.debug("APPLY fetch: " + currentQuery + ", isMore: " + currentFetchingMore + ", offset: " + currentFetchOffset + ", resultSize: " + fetchedItems.length + ", oldSize: " + items.length);
//             console.debug(info);

             let newItems;
             if (currentFetchingMore) {
                 newItems = items;
                 fetchedItems.forEach(function(item) {
                     newItems.push(item);
                 });
             } else {
                 newItems = fetchedItems;
             }
             items = newItems;
             resolveItems(items);

             let newDisplayItems = [];
             fixedItems.forEach(function(item) {
                 newDisplayItems.push(item);
             });
             items.forEach(function(item) {
                 newDisplayItems.push(item);
             });
             displayItems = newDisplayItems;

             resolveItemMap(displayItems);

             hasMore = info.more && offsetCount > 0 && !fetchId;
             tooShort = info.too_short === true;

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
         }
     }).catch(function(err) {
         if (currentFetch === activeFetch) {
             console.error(err);

             fetchError = err;
             items = [];
             displayItems = fixedItems;
             offsetCount = 0;
             actualCount = 0;
             hasMore = false;
             tooShort = false;
             previousQuery = null;
             previousFetch = currentFetch;
             activeFetch = null;
             fetched = false;
             fetchingMore = false;

             showFetching = false;

             resolveItemMap(displayItems);

             if (inputVisible) {
                 input.focus();
             } else {
                 selectinDisplay.focus();
             }
             openPopup();
         }
     });

     setTimeout(function() {
         if (activeFetch === currentFetch) {
             console.log("fetching...");
             showFetching = true;
         }
     }, FETCH_INDICATOR_DELAY);

     activeFetch = currentFetch;
     previousFetch = null;

     return currentFetch;
 }

 function resolveItems(items) {
     let off = 0;
     let act = 0;

     items.forEach(function(item) {
         if (item.id) {
             item.id = item.id.toString();
         }

         if (item.separator) {
             // NOTE KI separator is ignored always
         } else if (item.placeholder) {
             // NOTE KI does not affect pagination
             act += 1;
         } else {
             // NOTE KI normal or disabled affects pagination
             off += 1;
             act += 1;
         }
     });

     offsetCount = off;
     actualCount = act;
 }

 function resolveItemMap(displayItems) {
     let newMap = {};
     displayItems.forEach(function(item) {
         newMap[item.id] = item;
     });
     itemMap = newMap;
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
     if (hasMore && !fetchingMore) {
         // console.debug({scrollTop: popup.scrollTop, clientHeight: popup.clientHeight, scrollHeight: popup.scrollHeight, moreHeight: more.clientHeight});
         // console.debug(popup.scrollTop + popup.clientHeight >= popup.scrollHeight - more.height);

         if (popup.scrollTop + popup.clientHeight >= popup.scrollHeight - more.clientHeight * 2 - 2) {
             fetchItems(true);
         }
     }
 }

 function clearQuery() {
     query = '';
     previousQuery = null;
 }

 let activeFocusRequest = null;
 let passEvents = null;

 function focusTarget(target) {
     console.trace("request_Focus", target);
     activeFocusRequest = null;

     let handler = function() {
         console.log("HANDLE: request_Focus", target, activeFocusRequest);
         if (activeFocusRequest === handler) {
             console.log("HANDLE_HIT: request_Focus", target);
             activeFocusRequest = null;
             target.focus();
         } else {
             console.log("HANDLE_MISS: request_Focus", target);
         }
     }
     setTimeout(handler);
     activeFocusRequest = handler;
 }

 function openInput(focus, passEvent) {
     if (!typeahead) {
         return;
     }

     // TODO KI passing events *DOES NOT* work
//     passEvent = null;

     let wasVisible = inputVisible;
     inputVisible = true;

     if (!focus) {
         return;
     }

     focusTarget(input);

     if (!wasVisible) {
         if (passEvent) {
             passEvents = passEvents || [];
             // NOTE KI ensure event is received by *input*, not other random target
             passEvent.preventDefault();
             passEvents.push(passEvent);
         }
     }
 }

 function closeInput(focusToggle) {
     console.trace("CLOSE_INPUT", focusToggle);

     if (!typeahead) {
         return;
     }

     let wasVisible = inputVisible;
     if (wasVisible) {
         activeFocusRequest = null;
         inputVisible = false;
     }

     if (focusToggle) {
         focusTarget(selectionDisplay || toggle);
     } else {
         if (wasVisible) {
             toggle.focus();
         }
     }
 }

 function openPopup() {
     if (!popupVisible) {
         popupVisible = true;
         let w = container.offsetWidth;
         popup.style.minWidth = w + "px";
     }
 }

 function closePopup(focusToggle) {
     popupVisible = false;
     if (focusToggle) {
         focusTarget(selectionDisplay || toggle);
     }
 }

 function selectItemImpl(id) {
     id = id.toString();

     if (remote) {
         syncToReal
     }

     let item = itemMap[id] || selectedMap[id];

     if (!item) {
         console.error("MISSING item=" + id);
         return;
     }

     if (multiple) {
         if (item.id) {
             delete selectedMap[''];

             if (selectedMap[item.id]) {
                 delete selectedMap[item.id];
                 selectedMap = selectedMap;
             } else {
                 selectedMap[item.id] = item;
             }
         } else {
             selectedMap = {
                 [item.id]: item
             }
         }
     } else {
         selectedMap = {
             [item.id]: item
         }

         // NOTE KI reset query only for single item
         clearQuery();
         closeInput(false);
         closePopup(true);
     }

     selectedItems = Object.values(selectedMap);

     syncToReal(selectedMap);
     real.dispatchEvent(new CustomEvent('select-select', { detail: selectedMap }));
 }

 export function selectItem(id) {
     return fetchItems(false, id).then(function(response) {
         selectItemImpl(id);
     });
 }

 function selectElement(el) {
     selectItemImpl(el.dataset.id);
     if (el.dataset.selection) {
         if (!focusNextItem(el)) {
             focusPreviousItem(el);
         }
     }
 }

 function containsElement(el) {
     return el === input || el === toggle || el === selectionDisplay || popup.contains(el);
 }

 ////////////////////////////////////////////////////////////
 // HANDLERS
 //
 $: {
     if (mounted) {
         syncToReal(selectedMap);
     }
 }

 function syncFromReal() {
     if (isSyncToReal) {
         return;
     }

     let newMap = {};

     let options = real.selectedOptions;
     for (let i = options.length - 1; i >= 0; i--) {
         let item = createItemFromOption(options[i]);
         newMap[item.id] = item;
     }

     selectedMap = newMap;
     selectedItems = Object.values(newMap);
 }

 function syncToReal(selectedMap) {
     let changed = false;

     // Insert missing values
     // NOTE KI all existing values are *assumed* to be in sync data-attr wise
     if (remote) {
         selectedItems.forEach(function(item) {
             let el = real.querySelector('option[value="' + item.id.trim() + '"]');
             if (!el) {
                 el = createOptionFromItem(item);
                 real.appendChild(el);
             }
         });
     }

     let options = real.options;
     for (let i = options.length - 1; i >= 0; i--) {
         let el = options[i];
         let curr = !!selectedMap[el.value];
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

 onMount(function() {
     real.classList.add('d-none');
     multiple = real.multiple;

     if (remote) {
         setupRemote();
     } else {
         fetcher = inlineFetcher
     }


     // Initial selection
     syncFromReal();

     real.addEventListener('change', function() {
         if (!isSyncToReal) {
             syncFromReal();
             console.log("FROM_REAL", selectedMap);
         }
     });

     mounted = true;
 });

 ////////////////////////////////////////////////////////////
 //
 let inputKeypressHandlers = {
     base: function(event) {
     },
 };

 let inputKeydownHandlers = {
     base: function(event) {
         wasDown = true;
         openInput(true);
     },
     ArrowDown: function(event) {
         let item = popupVisible ? popup.querySelectorAll('.ki-js-item')[0] : null;
         if (item) {
             while (item && item.classList.contains('ki-js-blank')) {
                 item = item.nextElementSibling;
             }
             item.focus();
         } else {
             openPopup();
             fetchItems(false);
         }
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
         closeInput(true);
     },
     Tab: nop,
 };

 let inputKeyupHandlers = {
     base: function(event) {
         if (wasDown) {
             openPopup();
             fetchItems(false);
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

 let toggleKeydownHandlers = {
     base: function(event) {
         if (isValidKey(event)) {
             openInput(true, event);
         }
     },
     ArrowDown: inputKeydownHandlers.ArrowDown,
     ArrowUp: inputKeydownHandlers.ArrowDown,
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
         closeInput(true);
     },
     Tab: nop,
     // skip "meta" keys from triggering search
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
 };

 function focusPreviousItem(item) {
     let next = event.target.previousElementSibling;

     if (next) {
         while (next && next.classList.contains('ki-js-blank')) {
             next = next.previousElementSibling;
         }
         if (next && !next.classList.contains('ki-js-item')) {
             next = null;
         }
     }

     if (!next) {
         next = inputVisible ? input : (selectionDisplay || toggle);
     }
     if (next) {
         next.focus();
     }

     return next;
 }

 function focusNextItem(item) {
     let next = item.nextElementSibling;

     if (next) {
         while (next && next.classList.contains('ki-js-blank')) {
             next = next.nextElementSibling;
         }

         if (next && !next.classList.contains('ki-js-item')) {
             next = null;
         }
     }

     if (next) {
         next.focus();
     }
     return next;
 }

 let itemKeydownHandlers = {
     base: function(event) {
         if (isValidKey(event)) {
             openInput(true, event);
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
         if (!hasModifier(event)) {
             selectElement(event.target);
             event.preventDefault();
         }
     },
     Escape: function(event) {
         cancelFetch();
         clearQuery();
         closePopup(true);
         closeInput(true);
     },
     // allow "meta" keys to navigate in items
     PageUp: nop,
     PageDown: nop,
     Home: nop,
     End: nop,
     Tab: function(event) {
         if (inputVisible) {
             input.focus();
         } else {
             (selectionDisplay || toggle).focus();
         }
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

         let rect = popup.getBoundingClientRect();
         let item = document.elementFromPoint(scrollLeft + rect.x + 10, scrollTop + rect.top + 1);
         if (!item) {
             item = popup.querySelector('.ki-js-item:first-child');
         } else {
             if (!item.classList.contains('ki-js-item')) {
                 item = popup.querySelector('.ki-js-item:first-child');
             }
         }
         if (item) {
             item.focus();
         }
         event.preventDefault();
     },
     PageDown: function(event) {
         let scrollLeft = document.body.scrollLeft;
         let scrollTop = document.body.scrollTop;
         let h = popup.offsetHeight;

         let rect = popup.getBoundingClientRect();
         let item = document.elementFromPoint(scrollLeft + rect.x + 10, scrollTop + rect.top + h - 10);
         if (!item) {
             item = popup.querySelector('.ki-js-item:last-child');
         } else {
             if (!item.classList.contains('ki-js-item')) {
                 item = popup.querySelector('.ki-js-item:last-child');
             }
         }
         if (item) {
             item.focus();
         }

         event.preventDefault();
     },
     Home: function(event) {
         let item = popup.querySelector('.ki-js-item:first-child');
         if (item) {
             item.focus();
         }
         event.preventDefault();
     },
     End: function(event) {
         let item = popup.querySelector('.ki-js-item:last-child');
         if (item) {
             item.focus();
         }
         event.preventDefault();
     },
 }


 ////////////////////////////////////////////////////////////
 //
 function handleEvent(code, handlers, event) {
     console.debug(event);
     (handlers[code] || handlers.base)(event);
 }

 function handleBlur(event) {
     if (!containsElement(event.relatedTarget)) {
         cancelFetch();

         clearQuery();
         closePopup(false);
         closeInput(false);

         syncFromReal();
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

 function handleSelectionKeydown(event) {
     handleEvent(event.code, toggleKeydownHandlers, event);
 }

 function handleToggleKeydown(event) {
     handleEvent(event.code, toggleKeydownHandlers, event);
 }

 function handleSelectionClick(event) {
     if (event.button === 0 && !hasModifier(event)) {
         if (popupVisible) {
             toggle.focus();
             openInput(true);
         } else {
             openPopup();
             fetchItems(false);
         }
     }
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
 const I18N_DEFAULTS = {
     clear: 'Clear',
     fetching: 'Searching..',
     no_results: 'No results',
     too_short: 'Too short',
     has_more: 'More...',
     fetching_more: 'Searching more...',
 };

 const FETCH_INDICATOR_DELAY = 150;
 const CARET_DOWN = 'fas fa-caret-down';
 const CARET_FETCHING = 'far fa-hourglass';

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

 // https://stackoverflow.com/questions/596481/is-it-possible-to-simulate-key-press-events-programmatically
 function sendKeyPress(target, orig) {
     console.log("SEND", orig);
     var down = new KeyboardEvent(
         "keydown", // event type: keydown, keyup, keypress
         {
             key: orig.key,
             ctrlKey: orig.ctrlKey,     // ctrlKey
             altKey: orig.altKey,     // altKey
             shiftKey: orig.shiftKey,     // shiftKey
             metaKey: orig.metaKey,     // metaKey
             keyCode: orig.keyCode,        // keyCode: unsigned long - the virtual key code, else 0
             charCode: orig.charCode          // charCode: unsigned long - the Unicode character associated with the depressed key, else 0
         }
     );
     console.log("SEND_DOWN", down);
     target.dispatchEvent(down);

     var up = new KeyboardEvent(
         "keyup", // event type: keydown, keyup, keypress
         {
             key: orig.key,
             ctrlKey: orig.ctrlKey,     // ctrlKey
             altKey: orig.altKey,     // altKey
             shiftKey: orig.shiftKey,     // shiftKey
             metaKey: orig.metaKey,     // metaKey
             keyCode: orig.keyCode,        // keyCode: unsigned long - the virtual key code, else 0
             charCode: orig.charCode          // charCode: unsigned long - the Unicode character associated with the depressed key, else 0
         }
     );
     console.log("SEND_UP", up);
     target.dispatchEvent(up);
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
     if (item.itemClass) {
         el.setAttribute('data-item-class', item.itemClass);
     }
     el.textContent = item.text;
     return el;
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
     max-height: 50vh;
     max-width: 90vw;
     overflow-y: auto;
 }
 :global(.ss-input) {
/*
     width: 100%;
     padding-left: 0.5rem;
     padding-right: 0.5rem;
*/
 }
 :global(.ss-item) {
     padding-left: 0.5rem;
     padding-right: 0.5rem;
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
<div class="ss-container form-control p-0 border-0 {extraClass}"
     bind:this={container}>

  {#if typeahead}
    <div class="input-group">
      <input class="ss-input form-control {inputVisible ? '' : 'd-none'}"
             autocomplete="new-password"
             autocorrect=off
             autocapitalize=off
             spellcheck=off

             bind:this={input}
             bind:value={query}
             on:blur={handleInputBlur}
             on:keypress={handleInputKeypress}
             on:keydown={handleInputKeydown}
             on:keyup={handleInputKeyup}>

      <div class="form-control {inputVisible ? 'd-none' : ''}"
           tabindex="0"
           bind:this={selectionDisplay}
           on:blur={handleBlur}
           on:keydown={handleSelectionKeydown}
           on:click={handleSelectionClick} >

        <span class="ss-no-click ss-selection text-dark d-flex">
          {#each selectedItems as item, index (item.id)}
            <span class="ss-no-click ss-selected-item {item.itemClass} {item.id ? '' : 'text-muted'}">{index > 0 ? ', ' : ''}{item.text}</span>
          {/each}
        </span>
      </div>

      <div class="input-group-append">
        <button class="btn btn-outline-secondary"
                type="button"
                tabindex="-1"
                bind:this={toggle}
                on:blur={handleBlur}
                on:keydown={handleToggleKeydown}
                on:click={handleToggleClick}>

          <i class="text-dark {showFetching ? CARET_FETCHING : CARET_DOWN}"></i>
        </button>
      </div>
    </div>
  {:else}
    <button class="form-control d-flex"
            type="button"
            tabindex="0"
            bind:this={toggle}
            on:blur={handleBlur}
            on:keydown={handleToggleKeydown}
            on:click={handleToggleClick}>

      <span class="ss-no-click ss-selection text-dark d-flex">
        {#each selectedItems as item, index (item.id)}
          <span class="ss-no-click ss-selected-item {item.itemClass} {item.id ? '' : 'text-muted'}">{index > 0 ? ', ' : ''}{item.text}</span>
        {/each}
        <span class="ml-auto">
          <i class="text-dark {showFetching ? CARET_FETCHING : CARET_DOWN}"></i>
        </span>
      </span>
    </button>
  {/if}

  <div class="dropdown-menu ss-popup {popupVisible ? 'show' : ''}"
       bind:this={popup}
       on:scroll={handlePopupScroll}>
    {#if fetchError}
      <div tabindex="-1" class="dropdown-item text-danger ss-item">
        {fetchError}
      </div>

    {:else if activeFetch && !fetchingMore}
      <!--
      <div tabindex="-1" class="dropdown-item text-muted ss-item">
        {translate('fetching')}
      </div>
      -->
    {:else if actualCount === 0}
      <div tabindex="-1" class="dropdown-item text-muted ss-item">
        {#if tooShort }
          {translate('too_short')}
        {:else}
          {translate('no_results')}
        {/if}
      </div>
    {/if}

    {#if typeahead}
      {#each selectedItems as item, index (item.id)}
        {#if item.id}
          <div tabindex=1
               class="ki-js-item dropdown-item ss-item"
               data-id="{item.id}"
               data-selection="true"
               on:blur={handleBlur}
               on:click={handleItemClick}
               on:keydown={handleItemKeydown}
               on:keyup={handleItemKeyup}>

            <div class="ss-no-click">
              {#if multiple}
                <div class="d-inline-block align-top">
                  {#if item.id}
                    <i class="far fa-check-square"></i>
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
                  <div class="ss-no-click text-muted">
                    {item.desc}
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/if}
      {/each}

      <div tabindex="-1"
           class="dropdown-divider ki-js-blank"
           on:keydown={handleItemKeydown}>
      </div>
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
            <div class="ss-no-click text-muted">
              {item.desc}
            </div>
          {/if}
        </div>

      {:else}
        <div tabindex=1
             class="ki-js-item dropdown-item ss-item {!item.id ? 'text-muted' : ''} {selectedMap[item.id] ? 'alert-primary' : ''}"
             data-id="{item.id}"
             on:blur={handleBlur}
             on:click={handleItemClick}
             on:keydown={handleItemKeydown}
             on:keyup={handleItemKeyup}>

          <div class="ss-no-click">
            {#if multiple}
              <div class="d-inline-block align-top">
                {#if item.id}
                  <i class="far {selectedMap[item.id] ? 'fa-check-square' : 'fa-square'}"></i>
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
                <div class="ss-no-click text-muted">
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
           bind:this={more}>
        {translate('has_more')}
      </div>
    {/if}
  </div>
</div>
