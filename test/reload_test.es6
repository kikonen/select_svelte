function testReload() {
  var el = document.querySelector('#select_opt_2');
  var node = document.createElement('option');
  node.value = 'fish';
  node.innerHTML ='Fish';
  node.selected = true;
  el.appendChild(node);
  el.dispatchEvent(new Event('select-reload'));
}

function testMutate() {
  var el = document.querySelector('#select_opt_2');
  var node = document.createElement('option');
  node.value = 'fish';
  node.innerHTML ='Fish';
  node.selected = true;
  el.appendChild(node);
//  el.dispatchEvent(new Event('select-reload'));
}
