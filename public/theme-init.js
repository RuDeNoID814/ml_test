(function () {
  try {
    var t = localStorage.getItem('lifegame:theme');
    var dark = t === 'dark' || (t !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.dataset.theme = 'dark';
  } catch (_) {}
})();
