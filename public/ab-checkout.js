// A/B test: variant "a" keeps the Hotmart checkout, variant "b" sends buyers to the
// LofyPay Pix checkout at /checkout/. Force a variant with ?checkout=a or ?checkout=b.
(function () {
  var KEY = "ab_checkout", SPLIT_B = 0.5;
  var forced = new URLSearchParams(location.search).get("checkout");
  var variant;
  try { variant = localStorage.getItem(KEY); } catch (e) {}
  if (forced === "a" || forced === "b") variant = forced;
  if (variant !== "a" && variant !== "b") variant = Math.random() < SPLIT_B ? "b" : "a";
  try { localStorage.setItem(KEY, variant); } catch (e) {}
  document.documentElement.setAttribute("data-checkout-variant", variant);

  function report() {
    try { if (window.gtag) gtag("event", "ab_checkout_variant", { variant: variant }); } catch (e) {}
  }

  var ready = false;
  if (variant === "b") {
    // Only send buyers to the Pix checkout once it can actually take payments.
    fetch("/api/pix", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (d) { ready = Boolean(d.ready); rewrite(); })
      .catch(function () {});
  }

  function rewrite() {
    if (variant !== "b" || !ready) return;
    var links = document.querySelectorAll('a[href*="pay.hotmart.com"]');
    for (var i = 0; i < links.length; i++) {
      links[i].href = "/checkout/";
      links[i].removeAttribute("target");
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", rewrite);
  else rewrite();
  window.addEventListener("load", function () { rewrite(); report(); });
})();
