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
 export let query;
 export let delay = 0;
 export let extraClass = '';

 let input;
 let toggle;
 let popup;
 let more;

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
 let selectedItem = null;
 let downQuery = null;
 let wasDown = false;

 let isSyncToReal = false;


 ////////////////////////////////////////////////////////////
 //

 function nop() {};

 ////////////////////////////////////////////////////////////
 // select

 function fetcherSelect(offset, query) {
     let promise = new Promise(function(resolve, reject) {
         let entries = []

         real.querySelectorAll('option').forEach(function(el) {
             let ds = el.dataset;
             let item = {
                 id: el.value,
                 text: el.text,
                 desc: ds.desc
             };
             entries.push(item);
         });

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

             input.focus();
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

 function closePopup(focusInput) {
     popupVisible = false;
     if (focusInput) {
         input.focus();
     }
 }

 function openPopup() {
     if (!popupVisible) {
         popupVisible = true;
         let w = input.parentElement.offsetWidth;
         popup.style.minWidth = w + "px";
     }
 }

 function selectItem(el) {
     let item = entries[el.dataset.index];
     if (item) {
         selectedItem = item;
         let changed = item.text !== query
         query = item.text;

         previousQuery = query.trim();
         if (previousQuery.length > 0) {
             previousQuery = query;
         }

         closePopup(true);
         if (changed) {
             previousQuery = null;
         }

         syncToReal(query, selectedItem);
         real.dispatchEvent(new CustomEvent('select-select', { detail: item }));
//     } else {
//         console.debug("MISSING item", el);
     }
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
     if (syncToReal) {
         syncToReal(query, selectedItem);
     }
 }

 function syncFromReal() {
     if (isSyncToReal) {
         return;
     }

     let el = real.options[real.selectedIndex];
     let item;
     if (el) {
         let ds = el.dataset;

         item = {
             id: el.value,
             text: el.text,
             desc: ds.desc,
         };
     } else {
         item = {
             id: '',
             text: '',
         };
     }

     query = item.text || '';
     selectedItem = item;
 }

 function syncToReal(query, selectedItem) {
     let oldOption;
     let newOption;
     let selectedValue = selectedItem.id.toString();

     real.querySelectorAll('option').forEach(function(el) {
         if (el.selected) {
             oldOption = el;
         }
         if (el.value === selectedValue) {
             newOption = el;
         }
     });

     if (newOption !== oldOption) {
         try {
             isSyncToReal = true;
             oldOption.removeAttribute('selected');
             newOption.setAttribute('selected', 'true');
             real.dispatchEvent(new Event('change'));
         } finally {
             isSyncToReal = false;
         }
     }
 }

 onMount(function() {
     real.classList.add('d-none');
     fetcher = fetcherSelect

     syncFromReal();
     real.addEventListener('change', function() {
         syncFromReal();
     });
 });

 let inputKeypressHandlers = {
     base: function(event) {
         selectedItem = null;
     },
 };

 let inputKeydownHandlers = {
     base: function(event) {
         wasDown = true;
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
         closePopup(false);
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
         input.focus();
     },
     ArrowDown: inputKeydownHandlers.ArrowDown,
     ArrowUp: inputKeydownHandlers.ArrowDown,
     Escape: function(event) {
         cancelFetch();
         closePopup(false);
         input.focus();
     },
     Tab: function(event) {
         input.focus();
     },
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
 .ki-select-popup {
     max-height: 15rem;
     max-width: 90vw;
     overflow-y: auto;
 }
 .ki-no-click {
     pointer-events: none;
 }
</style>

<!-- ------------------------------------------------------------ -->
<!-- ------------------------------------------------------------ -->
<div class="input-group ki-select">
  <input class="{real.getAttribute('class')} {extraClass}"
         autocomplete=new-password
         autocorrect=off
         autocapitalize=off
         spellcheck=off

         data-target="{real.id}"
         placeholder="{real.placeholder}"
         bind:this={input}
         bind:value={query}
         on:blur={handleBlur}
         on:keypress={handleInputKeypress}
         on:keydown={handleInputKeydown}
         on:keyup={handleInputKeyup}>
  <div class="input-group-append">
    <button class="btn btn-outline-secondary" type="button" tabindex="-1"
            bind:this={toggle}
            on:blur={handleBlur}
            on:keydown={handleToggleKeydown}
            on:click={handleToggleClick}>
      <i class="text-dark fas fa-caret-down"></i>
    </button>
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
          <div tabindex=1 class="ki-js-item dropdown-item"  data-index="{index}"
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
