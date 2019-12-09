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

 let container;
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

 let inputVisible = false;
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
         clearQuery();
         closePopup(true);
         closeInput(false);
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
             fetchEntries();
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
         openInput(true);
     },
     ArrowDown: inputKeydownHandlers.ArrowDown,
     ArrowUp: inputKeydownHandlers.ArrowDown,
     Enter: function(event) {
         openPopup();
         fetchEntries();
     },
     Escape: function(event) {
         cancelFetch();
         clearQuery();
         closePopup(false);
         closeInput(false);
     },
     Tab: function(event) {
         if (inputVisible) {
//             input.focus();
//             event.preventDefault();
         }
     },
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
         openInput(true);
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
</div>
