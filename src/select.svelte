<script>
 import {onMount} from 'svelte';

 const I18N_DEFAULTS = {
     fetching: 'Searching..',
     no_results: 'No results',
     too_short: 'Too short',
     has_more: 'More...',
     fetching_more: 'Searching more...',
 };

 export let real;
 export let fetcher;
 export let queryMinLen = 0;
 export let translations = I18N_DEFAULTS;
 export let delay = 0;
 export let extraClass = '';
 export let typeahead = false;

 let query = '';

 let input;
 let toggle;
 let popup;
 let more;

 let mounted = false;

 let entries = [];
 let offsetCount = 0;
 let displayCount = 0;

 let message = null;
 let messageClass = null;

 let hasMore = false;
 let tooShort = false;
 let fetchingMore = false;
 let fetchError = null;

 let popupVisible = false;
 let activeFetch = null;

 let previousQuery = null;
 let fetched = false;

 let multiple = false;
 let selection = {};
 let selectedItems = [];

 let downQuery = null;
 let wasDown = false;

 let isSyncToReal = false;


 ////////////////////////////////////////////////////////////
 //

 function nop() {};

 ////////////////////////////////////////////////////////////
 // select

 function fetcherSelect(offset, query) {
     console.log("SELECT: " + query);

     let promise = new Promise(function(resolve, reject) {
         let entries = []
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
                 entries.push(item);
             }
         }

         let response = {
             entries: entries,
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
 function fetchEntries(more) {
     let currentQuery = query.trim();
     if (currentQuery.length > 0) {
         currentQuery = query;
     }

     if (!more && !fetchingMore && currentQuery === previousQuery) {
         return;
     }

//     console.debug("START fetch: " + currentQuery);

     cancelFetch();

     let fetchOffset = 0;

     if (more) {
         fetchOffset = offsetCount;
         fetchingMore = true;
     } else {
         entries = [];
         offsetCount = 0;
         displayCount = 0;
         hasMore = false;
         fetched = false;
         fetchingMore = false;
     }
     fetchError = null;

     let currentFetchOffset = fetchOffset;
     let currentFetchingMore = fetchingMore;

     let currentFetch = new Promise(function(resolve, reject) {
         if (currentFetchingMore) {
//             console.debug("MOR hit: " + currentQuery);
             resolve(fetcher(currentFetchOffset, currentQuery));
         } else {
             if (currentQuery.length < queryMinLen) {
//                 console.debug("TOO_SHORT fetch: " + currentQuery + ", limit: " + queryMinLen);
                 resolve({
                     entries: [],
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
                         resolve(fetcher(currentFetchOffset, currentQuery));
                     } else {
//                         console.debug("TIMER reject: " + currentQuery);
                         reject("cancel");
                     }
                 }, delay);
             }
         }
     }).then(function(response) {
         if (currentFetch === activeFetch) {
             let newEntries = response.entries || [];
             let info = response.info || {};

//             console.debug("APPLY fetch: " + currentQuery + ", isMore: " + currentFetchingMore + ", offset: " + currentFetchOffset + ", resultSize: " + newEntries.length + ", oldSize: " + entries.length);
//             console.debug(info);

             let updateEntries;
             if (currentFetchingMore) {
                 updateEntries = entries;
                 newEntries.forEach(function(item) {
                     updateEntries.push(item);
                 });
             } else {
                 updateEntries = newEntries;
             }
             entries = updateEntries;
             updateCounts(entries);

             hasMore = info.more && offsetCount > 0;
             tooShort = info.too_short === true;

             previousQuery = currentQuery;
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
             entries = [];
             offsetCount = 0;
             displayCount = 0;
             hasMore = false;
             tooShort = false;
             previousQuery = null;
             activeFetch = null;
             fetched = false;
             fetchingMore = false;

             toggle.focus();
             openPopup();
         }
     });

     activeFetch = currentFetch;
 }

 function updateCounts(entries) {
     let off = 0;
     let disp = 0;

     entries.forEach(function(item) {
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
             fetchEntries(true);
         }
     }
 }

 function closePopup(focusToggle) {
     popupVisible = false;
     if (focusToggle) {
         toggle.focus();
     }
 }

 function openPopup() {
     if (!popupVisible) {
         popupVisible = true;
         let w = toggle.parentElement.offsetWidth;
         popup.style.minWidth = w + "px";
     }
 }

 function selectItem(el) {
     let item = entries[el.dataset.index];
     if (!item) {
         console.error("MISSING item", el);
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
//         query = '';
//         previousQuery = null;

         closePopup(true);
     }

     syncToReal(selection);
     real.dispatchEvent(new CustomEvent('select-select', { detail: selection }));
 }

 function containsElement(el) {
     return el === input || el === toggle || popup.contains(el);
 }

 function hasModifier(event) {
     return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
 }

 function translate(key) {
     return translations[key] || I18N_DEFAULTS[key];
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

     fetcher = fetcherSelect

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
 let toggleKeydownHandlers = {
     base: nop,
     ArrowDown: function(event) {
         if (popupVisible) {
             let item = typeahead ? input : popup.querySelectorAll('.ki-js-item')[0];
             if (item) {
                 while (item && item.classList.contains('ki-js-blank')) {
                     item = item.nextElementSibling;
                 }
             }
             if (item) {
                 item.focus();
             }
         } else {
             openPopup();
             if (typeahead) {
                 setTimeout(function() {
                     input.focus();
                 });
             }
             fetchEntries();
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
         closePopup(false);
     },
     Tab: nop,
 };

 let itemKeydownHandlers = {
     base: function(event) {
         input.focus();
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
         selectItem(event.target)
         event.preventDefault();
     },
     Escape: function(event) {
         cancelFetch();
         closePopup(true);
     },
     Tab: function(event) {
         toggle.focus();
         event.preventDefault();
     },
     // allow "meta" keys to navigate in items
     PageUp: nop,
     PageDown: nop,
     Home: nop,
     End: nop,
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


 let inputKeypressHandlers = {
     base: nop,
 };

 let inputKeydownHandlers = {
     base: function(event) {
         wasDown = true;
     },
     ArrowUp: nop,
     ArrowDown: function(event) {
         let item = popup.querySelectorAll('.ki-js-item')[0];
         if (item) {
             while (item && item.classList.contains('ki-js-blank')) {
                 item = item.nextElementSibling;
             }
         }
         if (item) {
             item.focus();
         }
         event.preventDefault();
     },
     Escape: itemKeydownHandlers.Escape,
     Tab: function(event) {
         toggle.focus();
         event.preventDefault();
     }
 };

 let inputKeyupHandlers = {
     base: function(event) {
         if (wasDown) {
             fetchEntries();
             input.focus();
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

 function handleEvent(code, handlers, event) {
     (handlers[code] || handlers.base)(event);
 }

 function handleBlur(event) {
     if (!containsElement(event.relatedTarget)) {
         cancelFetch();
         closePopup(false);

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
         if (popupVisible) {
             closePopup(false);
         } else {
             openPopup();
             fetchEntries();
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
         selectItem(event.target)
     }
 }

 function handlePopupScroll(event) {
     fetchMoreIfneeded();
 }
</script>

<!-- ------------------------------------------------------------ -->
<!-- ------------------------------------------------------------ -->
<style>
 .ki-select {
     position: relative;
 }
 .ki-selection {
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
     width: 100%;
     padding-left: 0.5rem;
     padding-right: 0.5rem;
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
</style>

<!-- ------------------------------------------------------------ -->
<!-- ------------------------------------------------------------ -->
<button
  class="ki-select form-control d-flex {real.getAttribute('class')} {extraClass}"
  type="button"
  bind:this={toggle}
  on:blur={handleBlur}
  on:keydown={handleToggleKeydown}
  on:click={handleToggleClick}>

  <span class="ki-selection">
    {#each Object.values(selection) as item, index}
      <span class="{item.id ? 'text-dark' : 'text-muted'}">{index > 0 ? ', ' : ''}{item.text}</span>
    {/each}
  </span>
  <span class="ml-auto">
    <div class="ki-caret-container">
      <span class="ki-caret-down"></span>
    </div>
  </span>
</button>
<div class="dropdown-menu ki-select-popup {popupVisible ? 'show' : ''}"
     bind:this={popup}
     on:scroll={handlePopupScroll}>
  {#if typeahead}
    <div class="dropdown-item ki-select-item">
      <input class="ki-select-input border"
         tabindex="1"
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
    </div>
  {/if}

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
    {#each entries as item, index}
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
           data-index="{index}"
           on:blur={handleBlur}
           on:click={handleItemClick}
           on:keydown={handleItemKeydown}
           on:keyup={handleItemKeyup}>

          <div class="ki-no-click">
            {item.display_text || item.text}
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
