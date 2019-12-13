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
 let toggle;
 let popup;
 let more;

 let mounted = false;

 let items = [];
 let offsetCount = 0;
 let displayCount = 0;

 let selection = {};
 let selectedItems = [];

 let message = null;
 let messageClass = null;

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

 function nop() {};

 ////////////////////////////////////////////////////////////
 // select

 function inlineFetcher(offset, query) {
     console.log("INLINE_SELECT_FETCH: " + query);

     let promise = new Promise(function(resolve, reject) {
         let items = []
         let pattern = query.toUpperCase().trim();

         let options = real.options;
         for (let i = 0; i < options.length; i++) {
             let el = options[i];
             let ds = el.dataset;
             let item = {
                 id: el.value || '',
                 text: el.text || '',
                 desc: ds.desc || ''
             };
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
         displayCount = 0;
         hasMore = false;
         fetched = false;
     }
     fetchingMore = more;
     fetchError = null;

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
             let newItems = response.items || [];
             let info = response.info || {};

//             console.debug("APPLY fetch: " + currentQuery + ", isMore: " + currentFetchingMore + ", offset: " + currentFetchOffset + ", resultSize: " + newItems.length + ", oldSize: " + items.length);
//             console.debug(info);

             let updateItems;
             if (currentFetchingMore) {
                 updateItems = items;
                 newItems.forEach(function(item) {
                     updateItems.push(item);
                 });
             } else {
                 updateItems = newItems;
             }
             items = updateItems;
             resolveItems(items);

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
//         } else {
//             console.debug("ABORT fetch: " + currentQuery);
         }
     }).catch(function(err) {
         if (currentFetch === activeFetch) {
             console.error(err);

             fetchError = err;
             items = [];
             offsetCount = 0;
             displayCount = 0;
             hasMore = false;
             tooShort = false;
             previousQuery = null;
             previousFetch = currentFetch;
             activeFetch = null;
             fetched = false;
             fetchingMore = false;

             toggle.focus();
             openPopup();
         }
     });

     activeFetch = currentFetch;
     previousFetch = null;

     return currentFetch;
 }

 function resolveItems(items) {
     let off = 0;
     let disp = 0;

     items.forEach(function(item) {
         if (item.id) {
             item.id = item.id.toString();
         }

         if (item.separator) {
             // NOTE KI separator is ignored always
         } else if (item.placeholder) {
             // NOTE KI does not affect pagination
             disp += 1;
         } else {
             // NOTE KI normal or disabled affects pagination
             off += 1;
             disp += 1;
         }
     });

     offsetCount = off;
     displayCount = disp;
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

 let focusingInput = null;

 function openInput(focusInput) {
     if (!typeahead) {
         return;
     }

     let wasVisible = inputVisible;
     inputVisible = true;

     if (!focusInput) {
         return;
     }

     if (wasVisible) {
         input.focus();
     } else {
         if (!focusingInput) {
             focusingInput = function() {
                 if (focusingInput) {
                     focusingInput = null;
                     input.focus();
                 }
             }
             setTimeout(focusingInput);
         }
     }
 }

 function closeInput(focusToggle) {
     if (!typeahead) {
         return;
     }

     focusingInput = null;
     inputVisible = false;
     if (focusToggle) {
         toggle.focus();
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
         toggle.focus();
     }
 }

 function selectItemImpl(id) {
     id = id.toString();

     if (remote) {
         syncToReal
     }

     let item = items.find(function(item) {
         return item.id.toString() === id;
     });

     if (!item) {
         console.error("MISSING item=" + id);
         return;
     }

     if (multiple) {
         if (item.id) {
             delete selection[''];

             if (selection[item.id]) {
                 delete selection[item.id];
                 selection = selection;
             } else {
                 selection[item.id] = item;
             }
         } else {
             Object.keys(selection).forEach(function (id) {
                 delete selection[id];
             });
             selection[item.id] = item;
         }
     } else {
         if (!selection[item.id]) {
             Object.keys(selection).forEach(function (id) {
                 delete selection[id];
             });
         }
         selection[item.id] = item;

         // NOTE KI reset query only for single item
         clearQuery();
         closePopup(true);
         closeInput(false);
     }

     syncToReal(selection);
     real.dispatchEvent(new CustomEvent('select-select', { detail: selection }));
 }

 export function selectItem(id) {
     return fetchItems(false, id).then(function(response) {
         selectItemImpl(id);
     });
 }

 function selectElement(el) {
     selectItemImpl(el.dataset.id);
 }

 function containsElement(el) {
     return el === input || el === toggle || popup.contains(el);
 }

 ////////////////////////////////////////////////////////////
 // HANDLERS
 //
 $: {
     if (mounted) {
         syncToReal(selection);
     }
 }

 function syncFromReal() {
     if (isSyncToReal) {
         return;
     }

     let newSelection = {};

     let options = real.selectedOptions;

     for (let i = options.length - 1; i >= 0; i--) {
         let el = options[i];
         let ds = el.dataset;
         let item = {
             id: el.value,
             text: el.text,
         };
         if (ds.desc) {
             item.desc = ds.desc;
         }
         newSelection[item.id] = item;
     }
     selection = newSelection;
 }

 function syncToReal(selection) {
     let changed = false;

     // Insert missing values
     if (remote) {
         Object.values(selection).forEach(function(item) {
             let el = real.querySelector('option[value="' + item.id.trim() + '"]');
             if (!el) {
                 let el = document.createElement('option');
                 el.setAttribute('value', item.id);
                 if (item.desc) {
                     el.setAttribute('data-desc', item.desc);
                 }
                 el.textContent = item.text;
                 real.appendChild(el);
             }
         });
     }

     let options = real.options;
     for (let i = options.length - 1; i >= 0; i--) {
         let el = options[i];
         let curr = !!selection[el.value];
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

 onMount(function() {
     real.classList.add('d-none');
     multiple = real.multiple;

     if (remote) {
         // nothing
     } else {
         fetcher = inlineFetcher
     }


     // Initial selection
     syncFromReal();

     real.addEventListener('change', function() {
         if (!isSyncToReal) {
             syncFromReal();
             console.log("FROM_REAL", selection);
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
         closeInput(false);
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
         if (isCharacterKey(event)) {
             openInput(true);
             event.preventDefault();
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
         closeInput(false);
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

 let itemKeydownHandlers = {
     base: function(event) {
         if (isCharacterKey(event)) {
             openInput(true);
             event.preventDefault();
         }
     },
     ArrowDown: function(event) {
         let next = event.target.nextElementSibling;

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
         event.preventDefault();
     },
     ArrowUp: function(event) {
         let next = event.target.previousElementSibling;

         if (next) {
             while (next && next.classList.contains('ki-js-blank')) {
                 next = next.previousElementSibling;
             }
             if (next && !next.classList.contains('ki-js-item')) {
                 next = null;
             }
         }

         if (next) {
             next.focus();
         } else {
             input.focus();
         }
         event.preventDefault();
     },
     Enter: function(event) {
         selectElement(event.target)
         event.preventDefault();
     },
     Escape: function(event) {
         cancelFetch();
         clearQuery();
         closePopup(true);
         closeInput(false);
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
             toggle.focus();
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
//     console.log(event);
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
     handleEvent(event.key, inputKeypressHandlers, event);
 }

 function handleInputKeydown(event) {
     handleEvent(event.key, inputKeydownHandlers, event);
 }

 function handleInputKeyup(event) {
     handleEvent(event.key, inputKeyupHandlers, event);
 }

 function handleToggleKeydown(event) {
     handleEvent(event.key, toggleKeydownHandlers, event);
 }

 function handleToggleClick(event) {
     if (event.button === 0 && !hasModifier(event)) {
         toggle.focus();
         if (popupVisible) {
             closePopup(false);
         } else {
             openPopup();
             fetchItems(false);
         }
     }
 }

 function handleItemKeydown(event) {
     handleEvent(event.key, itemKeydownHandlers, event);
 }

 function handleItemKeyup(event) {
     handleEvent(event.key, itemKeyupHandlers, event);
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
 export let translations = I18N_DEFAULTS;

 function translate(key) {
     return translations[key] || I18N_DEFAULTS[key];
 }

 function hasModifier(event) {
     return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
 }

 function isCharacterKey(event) {
     return event.key.length == 1;
 }
</script>

<!-- ------------------------------------------------------------ -->
<!-- ------------------------------------------------------------ -->
<style>
 .ki-select-container {
     position: relative;
 }
 .ki-select-selection {
     white-space: nowrap;
     overflow: hidden;
     word-break: break-all;
     text-overflow: ellipsis;
 }
 .ki-select-popup {
     max-height: 15rem;
     max-width: 90vw;
     overflow-y: auto;
 }
 .ki-select-input {
/*
     width: 100%;
     padding-left: 0.5rem;
     padding-right: 0.5rem;
*/
 }
 .ki-select-selection {
     width: 100%;
     height: 100%;
 }
 .ki-select-item {
     padding-left: 0.5rem;
     padding-right: 0.5rem;
 }
 .ki-no-click {
     pointer-events: none;
 }
 .ki-caret-container {
     margin-top: 140%;
     margin-bottom: 100%;
 }

 .ki-caret-down {
     width: 0;
     height: 0;
     border-left: 0.35rem solid transparent;
     border-right: 0.35rem solid transparent;
     border-top: 0.35rem solid #232323;
 }

 .ki-w-0 {
     width: 0;
 }
 .ki-w-100 {
     width: 100%;
 }
</style>

<!-- ------------------------------------------------------------ -->
<!-- ------------------------------------------------------------ -->
<div class="ki-select-container {extraClass}"
     bind:this={container}>

  <div class="input-group">
    {#if typeahead}
    <input class="ki-select-input form-control {inputVisible ? '' : 'd-none'}"
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
    {/if}

    <div class="form-control {inputVisible ? 'd-none' : ''}"
         on:click={handleToggleClick} >
      <span class="ki-no-click ki-select-selection">
        {#each Object.values(selection) as item, index}
        <span class="ki-no-click {item.id ? 'text-dark' : 'text-muted'}">{index > 0 ? ', ' : ''}{item.text}</span>
        {/each}
      </span>
    </div>

    <div class="input-group-append">
      <button class="btn btn-outline-secondary"
              type="button"
              tabindex="0"
              bind:this={toggle}
              on:blur={handleBlur}
              on:keydown={handleToggleKeydown}
              on:click={handleToggleClick}>

        <i class="text-dark fas fa-caret-down"></i>
      </button>
    </div>
  </div>

  <div class="dropdown-menu ki-select-popup {popupVisible ? 'show' : ''}"
       bind:this={popup}
       on:scroll={handlePopupScroll}>

    {#if fetchError}
    <div tabindex="-1" class="dropdown-item text-danger">
      {fetchError}
    </div>
    {:else if activeFetch && !fetchingMore}
    <div tabindex="-1" class="dropdown-item text-muted">
      {translate('fetching')}
    </div>
    {:else if displayCount === 0}
    <div tabindex="-1" class="dropdown-item text-muted">
      {#if tooShort }
      {translate('too_short')}
      {:else}
      {translate('no_results')}
      {/if}
    </div>
    {:else}
    {#each items as item, index}
    {#if item.separator}
    <div tabindex="-1"
         class="dropdown-divider ki-js-blank"
         data-index="{index}"
         on:keydown={handleItemKeydown}>
    </div>
    {:else if item.disabled || item.placeholder}
    <div tabindex="-1" class="dropdown-item text-muted ki-js-blank"
         on:keydown={handleItemKeydown}>
      <div class="ki-no-click">
        {item.display_text || item.text}
      </div>
      {#if item.desc}
      <div class="ki-no-click text-muted">
        {item.desc}
      </div>
      {/if}
    </div>
    {:else}
    <div tabindex=1
         class="ki-js-item dropdown-item ki-select-item {!item.id ? 'text-muted' : ''} {selection[item.id] ? 'alert-primary' : ''}"
         data-id="{item.id}"
         on:blur={handleBlur}
         on:click={handleItemClick}
         on:keydown={handleItemKeydown}
         on:keyup={handleItemKeyup}>

      <div class="ki-no-click">
        {item.id ? (item.display_text || item.text) : translate('clear')}
      </div>
      {#if item.desc}
      <div class="ki-no-click text-muted">
        {item.desc}
      </div>
      {/if}
    </div>
    {/if}
    {/each}
    {/if}

    {#if hasMore}
    <div tabindex="-1"
         class="dropdown-item text-muted"
         bind:this={more}>
      {translate('has_more')}
    </div>
    {/if}
  </div>
</div>
