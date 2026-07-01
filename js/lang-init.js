/* Kaydedilmiş dil tercihini ilk boyamadan önce geri yükler (yanlış dil
   parlamasını önler). Head içinde senkron yüklenir — CSP nedeniyle inline değil. */
(function () {
  try {
    var l = localStorage.getItem('site-lang');
    if (l === 'tr' || l === 'en') document.documentElement.setAttribute('lang', l);
  } catch (e) {}
})();
