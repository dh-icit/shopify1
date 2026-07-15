let activeOptions = {};

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function getStyleProperty(element, property) {
  return window.getComputedStyle(element).getPropertyValue(property);
}

/*
 * Shopify Common JS
 *
 */

if (typeof window.Shopify === "undefined") {
  window.Shopify = {};
}

Shopify.bind = function (fn, scope) {
  return function () {
    return fn.apply(scope, arguments);
  };
};

Shopify.setSelectorByValue = function (selector, value) {
  for (let i = 0, count = selector.options.length; i < count; i++) {
    const option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function (target, eventName, callback) {
  target.addEventListener
    ? target.addEventListener(eventName, callback, false)
    : target.attachEvent(`on${eventName}`, callback);
};

Shopify.postLink = function (path, options) {
  options = options || {};
  const method = options.method || "post";
  const params = options.parameters || {};

  const form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for (const key in params) {
    const hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function (
  country_domid,
  province_domid,
  options,
) {
  this.countryEl = document.getElementById(country_domid);
  this.provinceEl = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(
    options.hideElement || province_domid,
  );

  Shopify.addListener(
    this.countryEl,
    "change",
    Shopify.bind(this.countryHandler, this),
  );

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry() {
    const value = this.countryEl.getAttribute("data-default");
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince() {
    const value = this.provinceEl.getAttribute("data-default");
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler(e) {
    var opt = this.countryEl.options[this.countryEl.selectedIndex];
    const raw = opt.getAttribute("data-provinces");
    const provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = "none";
    } else {
      for (let i = 0; i < provinces.length; i++) {
        var opt = document.createElement("option");
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions(selector, values) {
    for (let i = 0, count = values.length; i < values.length; i++) {
      const opt = document.createElement("option");
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  },
};

class QuantityCounter extends HTMLElement {
  constructor() {
    super();
    this.changeEvent = new Event("change", { bubbles: true });
    
  }

  connectedCallback() {
    this.counterEl = this.querySelector(".js-counter-quantity");
    this.increaseBtn = this.querySelector(".js-counter-increase");
    this.decreaseBtn = this.querySelector(".js-counter-decrease");

    this.min = parseInt(this.counterEl.min) || 1;
    this.max = parseInt(this.counterEl.max) || 999;

    this.increaseBtn.addEventListener("click", this.onIncrease.bind(this));
    this.decreaseBtn.addEventListener("click", this.onDecrease.bind(this));
  }

  onIncrease() {
    const currentValue = parseInt(this.counterEl.value);
    if (currentValue < this.max) {
      this.updateValue(currentValue + 1);
    //   this.alertAsse.innerHTML = "Product quantinty increase.";
    }
  }

  onDecrease() {
    const currentValue = parseInt(this.counterEl.value);
    if (this.dataset.cart) this.min = 0;
    if (currentValue > this.min) {
      this.updateValue(currentValue - 1);
    //   this.alertAsse.innerHTML = "Product quantinty decrease.";
    }
  }

  updateValue(value) {
    this.counterEl.value = value;
    this.counterEl.dispatchEvent(this.changeEvent);
  }
}

// Define the custom element
window.customElements.define("quantity-counter", QuantityCounter);

// without under functions main-password doesn't work

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe",
    ),
  );
}

function toggleTabindex(elements) {
  elements.forEach((el) => {
    const tabindex = el.getAttribute("tabindex");
    el.setAttribute("tabindex", tabindex === "0" ? "-1" : "0");
  });
}

function setTabindex(elements, tabindex) {
  elements.forEach((el) => {
    el.setAttribute("tabindex", tabindex);
  });
}

// Helper function to add multiple event listeners with the same handler
function addEventListeners(element, events, handler) {
  events.forEach((event) => element.addEventListener(event, handler));
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute("role", "button");
  summary.setAttribute(
    "aria-expanded",
    summary.parentNode.hasAttribute("open"),
  );

  if (summary.nextElementSibling.getAttribute("id")) {
    summary.setAttribute("aria-controls", summary.nextElementSibling.id);
  }

  summary.addEventListener("click", (event) => {
    event.currentTarget.setAttribute(
      "aria-expanded",
      !event.currentTarget.closest("details").hasAttribute("open"),
    );
  });

  if (summary.closest("header-drawer, menu-drawer")) return;
  summary.parentElement.addEventListener("keyup", onKeyUpEscape);
});

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  const elements = getFocusableElements(container);
  const first = elements[0];
  const last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener("keydown", trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function () {
    document.removeEventListener("keydown", trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function (event) {
    if (event.code.toUpperCase() !== "TAB") return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener("focusout", trapFocusHandlers.focusout);
  document.addEventListener("focusin", trapFocusHandlers.focusin);

  elementToFocus.focus();

  if (
    elementToFocus.tagName === "INPUT" &&
    ["search", "text", "email", "url"].includes(elementToFocus.type) &&
    elementToFocus.value
  ) {
    elementToFocus.setSelectionRange(0, elementToFocus.value.length);
  }
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener("focusin", trapFocusHandlers.focusin);
  document.removeEventListener("focusout", trapFocusHandlers.focusout);
  document.removeEventListener("keydown", trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== "ESCAPE") return;

  const openDetailsElement = event.target.closest("details[open]");
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector("summary");
  openDetailsElement.removeAttribute("open");
  summaryElement.setAttribute("aria-expanded", false);
  summaryElement.focus();
}

class ProductRecommendations extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);

      fetch(this.dataset.url)
        .then((response) => response.text())
        .then((text) => {
          const html = document.createElement("div");
          html.innerHTML = text;
          const recommendations = html.querySelector("product-recommendations");

          if (recommendations && recommendations.innerHTML.trim().length) {
            this.innerHTML = recommendations.innerHTML;
          }

          if (html.querySelector(".grid__item")) {
            this.classList.add("product-recommendations--loaded");
          }
        })
        .catch((e) => {
          console.error(e);
        });
    };

    new IntersectionObserver(handleIntersection.bind(this), {
      rootMargin: "0px 0px 400px 0px",
    }).observe(this);
  }
}

customElements.define("product-recommendations", ProductRecommendations);

// Safari detection
const detectSafari = () => {
  const ua = navigator.userAgent;

  const isSafari =
    ua.includes("Safari") &&
    !ua.includes("Chrome") &&
    !ua.includes("CriOS") &&
    !ua.includes("FxiOS") &&
    !ua.includes("Edg");

  const isMacOS = ua.includes("Macintosh");

  if (isSafari && isMacOS) {
    document.documentElement.classList.add("is-safari-macos");
  }
};

// Custom video controls
document.addEventListener("DOMContentLoaded", () => {
  detectSafari();

  const BUTTON_SELECTOR = ".wt-hero-video__sound-toggle";
  const BUTTON_TOGGLE_CLASS = "wt-hero-video__sound-toggle--unmuted";

  document.querySelectorAll(BUTTON_SELECTOR).forEach((button) => {
    button.addEventListener("click", () => {
      const parent = button.parentElement;
      if (!parent) return;

      let video = null;

      video = Array.from(parent.children).find((el) => el.tagName === "VIDEO");

      if (!video) {
        const heroVideoContainer = Array.from(parent.children).find(
          (el) =>
            el.classList && el.classList.contains("hero--video-background"),
        );

        if (heroVideoContainer) {
          video = heroVideoContainer.querySelector("video");
        }
      }

      if (!video) {
        const grandparent = parent.closest("video-controls");
        console.log(grandparent);
        video = Array.from(grandparent.children).find(
          (el) => el.tagName === "VIDEO",
        );
      }

      if (!video) return;

      video.muted = !video.muted;
      button.classList.toggle(BUTTON_TOGGLE_CLASS, !video.muted);
    });
  });
});


document.addEventListener("DOMContentLoaded", () => {

  const target = document.getElementById('pp-tracking-page-app');
  let labels = {
      order: 'Order Number',
      email: 'Email or Phone Number',
      nums: 'Tracking Number'
  };

  if (target) {
    const observer = new MutationObserver(() => {
      if (target.children.length > 0) {
        console.log('have HTML');
        Object.entries(labels).forEach(([name, ariaLabel]) => {
          let input = target.querySelector(`.pp_tracking_form_desktop input[name="${name}"]`);
          if (input) {
            input.setAttribute('aria-label', ariaLabel);
          }
        });
        Object.entries(labels).forEach(([name, ariaLabel]) => {
          let input = target.querySelector(`.pp_tracking_form_mobile input[name="${name}"]`);
          if (input) {
            input.setAttribute('aria-label', ariaLabel);
          }
        });
        observer.disconnect();
      }
    });

    observer.observe(target, { childList: true });
  }

});

(function () {
  function removeAriaLabel() {
    document
      .querySelectorAll('button[aria-label="Copy coupon code"]')
      .forEach(function (button) {
        button.removeAttribute('aria-label');
      });
  }

  removeAriaLabel();

  const observer = new MutationObserver(function () {
    removeAriaLabel();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();

(function () {
  function removeAriaLabel() {
    document
      .querySelectorAll('.jm-average-rating-display')
      .forEach(function (button) {
        button.removeAttribute('aria-label');
      });
  }

  removeAriaLabel();

  const observer = new MutationObserver(function () {
    removeAriaLabel();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();

(function () {
  function removeAriaLabel() {
    document
      .querySelectorAll('.shopify-payment-button__button')
      .forEach(function (button) {
        button.removeAttribute('aria-label');
      });
  }

  removeAriaLabel();

  const observer = new MutationObserver(function () {
    removeAriaLabel();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();


(function () {
  function replaceTags() {
    document
      .querySelectorAll('#judgeme_product_reviews .jm-average-rating-display > div p:nth-child(1)')
      .forEach(p => {
        if (p.dataset.h3Converted) return;

        const h3 = document.createElement('h3');
        h3.innerHTML = p.innerHTML;

        [...p.attributes].forEach(attr => {
          h3.setAttribute(attr.name, attr.value);
        });

        h3.dataset.h3Converted = '1';
        p.replaceWith(h3);
      });
  }

  const container = document.getElementById('judgeme_product_reviews');

  if (!container) return;

  replaceTags();

  new MutationObserver(replaceTags).observe(container, {
    childList: true,
    subtree: true
  });

  // observer.disconnect();
})();

document.addEventListener("DOMContentLoaded", () => {
    const btns = document.querySelectorAll('.marquee-toggle_btn');
    btns.forEach(item => {
        item.addEventListener('click', function(e) {
            const scrollingContainer = e.currentTarget.closest('.wt-brands__marquee');
            const isPlaying = this.getAttribute('aria-pressed') === 'true';

            scrollingContainer.classList.toggle('disabled');
            this.classList.toggle('stop');

            this.setAttribute('aria-pressed', !isPlaying);
        });
    });
    
    const error = document.querySelector('.form__error-field');
    if(error ) {
        document.querySelector('.form__field--email input').focus();
        if(error.innerHTML.length > 0) {
            document.querySelector('.form__message_asse').innerHTML = error.innerHTML;
        }
    }

    const button = document.querySelector('#shopify-subscription-policy-button');

    if (button) {
        const link = document.createElement('a');

        [...button.attributes].forEach(attr => {
            if (attr.name !== 'type') {
                link.setAttribute(attr.name, attr.value);
            }
        });

        link.href = '#';
        link.innerHTML = button.innerHTML;

        button.replaceWith(link);
    }

    const hero__title = document.querySelector('.wt-scrolling-text-banner .hero__title');

    if (hero__title) {
        const link = document.createElement('p');

        [...hero__title.attributes].forEach(attr => {
            if (attr.name !== 'type') {
                link.setAttribute(attr.name, attr.value);
            }
        });

        link.innerHTML = hero__title.innerHTML;

        hero__title.replaceWith(link);
    }

    const badge__stars = document.querySelector('.jdgm-prev-badge__stars');
    if(badge__stars) {
        badge__stars.addEventListener('click', function(e) {
            document.querySelector(".jm-review-widget-minimal-header__action-buttons .jm-button").focus();
        });
    }    

    const cart_checkout = document.querySelector('.cart__checkout_custom');
    if(cart_checkout) {
        cart_checkout.addEventListener('click', function(e) {
            e.preventDefault;
            const form = document.querySelector("form#cart");
            form.submit();
        });
    }

    setTimeout(function() {
        const teaser_badge = document.querySelector('.Teaser-pointer-Hn1zd');
        if(teaser_badge)
            teaser_badge.setAttribute('title', "50% of code");
    }, 3000);

});


const container = document.querySelector('[data-govx-id="page"]');

if (container) {
    const observer = new MutationObserver(() => {
        const button = container.querySelector('.shopify-payment-button__button');

        if (!button || button.tagName === 'A') {
            return;
        }

        const link = document.createElement('a');

        
        [...button.attributes].forEach(attr => {
            if (attr.name !== 'type') {
                link.setAttribute(attr.name, attr.value);
            }
        });

        
        link.href = button.dataset.govxHref;
        link.classList.add('wt-button');

        link.innerHTML = button.innerHTML;

        button.replaceWith(link);

        observer.disconnect();
    });

    observer.observe(container, {
        childList: true,
        subtree: true
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const shopifyAccount = document.querySelector('shopify-account');
    const root = shopifyAccount.shadowRoot;

    console.log(root);

    if (root) {

        const dialog = dialog.querySelector('.dialog');
        console.log(dialog);

        if (dialog) {
            dialog.setAttribute('role', 'dialog');
            dialog.setAttribute('aria-modal', 'true');

            dialog.querySelector("#close-button").setAttribute('title', 'Close modal');
        }

        const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        dialog.addEventListener('keydown', function(e) {
            // Нас интересует только клавиша Tab
            if (e.key !== 'Tab') return;

            console.log('dfdf');
        
            // Находим все фокусируемые элементы внутри диалога именно в момент нажатия
            const focusableElements = Array.from(dialog.querySelectorAll(focusableSelectors))
                .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null); // Исключаем скрытые и задизейбленные


            console.log(root);

            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            // ЕСЛИ нажат Shift + Tab (движение назад)
            if (e.shiftKey) {
                if (root.activeElement === firstElement) {
                    lastElement.focus();
                    console.log(lastElement);
                    e.preventDefault();  // Отменяем стандартный переход браузера наружу
                }
            } 
            // ЕСЛИ нажат просто Tab (движение вперед)
            else {
                if (root.activeElement === lastElement) {
                    console.log(firstElement);
                    firstElement.focus();
                e.preventDefault();   // Отменяем стандартный переход браузера наружу
                }
            }
        });

    }

});