// TO DO:
// 1. Calculator in Cart (Summ)
// 2. Navigation - links
// 3. Padding for plus and minus sign in cart
// 5. Menu for mobile version


const setting = {
  jsonPage: 1,
  jsonPerPage: 30,

  color: {
    0: 'pink',
    1: 'peachpuff',
    2: 'khaki',
    3: 'aquamarine',
    4: 'lightskyblue',
    5: 'thistle',
    6: 'darkturquoise',
  },
};

const cart = {
  count: 0,
  items: {},
  maxAmount: 10, // max count for one item in cart
  expireTime: 1440, // default value (minutes)

  class: {
    main: '.cart',
    toggle: '.js-cart-toggle',
    close: '.js-cart-close',
    remove: '.js-cart-remove',
    name: '.cart__name',
    amount: '.cart__amount',
    body: '.cart__body',
    decrease: '.js-item-decrease',
    increase: '.js-item-increase',
    deleteItem: '.js-item-delete',
    isVisible: 'is-visible',
    empty: 'cart_empty',
    show: 'cart_visible',
    itemTemplate: 'cart-item-template',

    catalog: '.cat',
    added: 'cat_added',
  },

  storage: {
    items: 'userCartList',
    count: 'userCartCount',
    lastChange: 'lastCartChange',
  },

  amount: {
    bubbleNode: document.querySelector('.js-cart-amount'),
    bubbleRender(count) {
      this.bubbleNode.textContent = count;
    },
    isVisible() {
      this.bubbleNode.classList.add('amount_visible');
    },
    isHide() {
      this.bubbleNode.classList.remove('amount_visible');
    },
  },

  init(args) {
    const _ = this;
    const nodeToggle = document.querySelector(_.class.toggle);
    const nodeClose = document.querySelector(_.class.close);
    const nodeRemove = document.querySelector(_.class.remove);
    _.applyUserArgs(args);
    _.checkExpire();

    if (localStorage.getItem(_.storage.count)) {
      _.count = +localStorage.getItem(_.storage.count);
      _.amount.bubbleRender(_.count);
      _.amount.isVisible();
      _.items = JSON.parse(localStorage.getItem(_.storage.items));

      Object.keys(_.items).forEach(id => _.renderItem(id, _.items[id].name, _.items[id].amount));
    }

    _.stringifyItems();

    if (_.count) {
      document.querySelector(_.class.main).classList.remove(_.class.empty);
    }

    nodeToggle.addEventListener('click', _.toggle.bind(this));
    nodeClose.addEventListener('click', _.toggle.bind(this));
    nodeRemove.addEventListener('click', _.clearCart.bind(this));
  },

  stringifyItems() {
    this.items.toString = () => JSON.stringify(this.items);
  },

  addItem(index, name) {
    const _ = this;
    if (_.items[index]) return;

    _.items[index] = { name, amount: 1 };
    _.renderItem(index, name, 1);
    _.count += 1;
    _.amount.isVisible();
    _.amount.bubbleRender(_.count);
    _.updateStorage();

    document.querySelector(`[data-index="${index}"]`).classList.add(_.class.added);
  },

  renderItem(index, name, amount) {
    const _ = this;
    const cartItem = document
      .getElementById(_.class.itemTemplate)
      .content.firstElementChild.cloneNode(true);
    const decrease = cartItem.querySelector(_.class.decrease);
    const increase = cartItem.querySelector(_.class.increase);
    const deleteItem = cartItem.querySelector(_.class.deleteItem);
    cartItem.dataset.cartIndex = index;
    cartItem.querySelector(_.class.name).innerHTML = name;
    cartItem.querySelector(_.class.amount).innerHTML = amount;
    document.querySelector(_.class.main).classList.remove(_.class.empty);

    decrease.addEventListener('click', _.decrease.bind(this, cartItem));
    increase.addEventListener('click', _.increase.bind(this, cartItem));
    deleteItem.addEventListener('click', _.removeItem.bind(this, cartItem));

    if (_.items[index].amount < _.maxAmount) {
      increase.classList.add(_.class.isVisible);
    }
    if (_.items[index].amount > 1) {
      decrease.classList.add(_.class.isVisible);
    }

    document.querySelector(_.class.body).appendChild(cartItem);
  },

  renderItemAmount(amount, index) {
    const cartItem = document.querySelector(`[data-cart-index="${index}"]`);
    cartItem.querySelector(this.class.amount).innerHTML = amount;
  },

  decrease(cartItem) {
    const _ = this;
    const index = cartItem.dataset.cartIndex;
    if (_.items[index].amount <= 1) return;

    _.count -= 1;
    _.items[index].amount -= 1;
    _.amount.bubbleRender(_.count);
    _.renderItemAmount(_.items[index].amount, index);
    _.updateStorage();

    if (_.items[index].amount === 1) {
      cartItem.querySelector(_.class.decrease).classList.remove(_.class.isVisible);
    }
    cartItem.querySelector(_.class.increase).classList.add(_.class.isVisible);
  },

  increase(cartItem) {
    const _ = this;
    const index = cartItem.dataset.cartIndex;
    if (_.items[index].amount >= _.maxAmount) {
      return;
    }

    _.count += 1;
    _.items[index].amount += 1;
    _.amount.bubbleRender(_.count);
    _.renderItemAmount(_.items[index].amount, index);
    _.updateStorage();

    if (_.items[index].amount > _.maxAmount - 1) {
      cartItem.querySelector(_.class.increase).classList.remove(_.class.isVisible);
    }
    cartItem.querySelector(_.class.decrease).classList.add(_.class.isVisible);
  },

  removeItem(cartItem) {
    const _ = this;
    const id = cartItem.dataset.cartIndex;
    _.count -= _.items[id].amount;
    delete _.items[id];

    document.querySelector(`[data-index="${id}"]`).classList.remove(_.class.added);
    cartItem.remove();
    _.amount.bubbleRender(_.count);

    if (_.count === 0) {
      _.clearCart();
    }
  },

  toggle() {
    const cartWindow = document.querySelector(this.class.main);
    cartWindow.classList.toggle(this.class.show);
  },

  applyUserArgs(args) {
    if (args) {
      Object.keys(args).forEach((key) => {
        this[key] = args[key];
        return this[key];
      });
    }
  },

  checkExpire() {
    const _ = this;
    const dateNow = new Date();
    const dateStorage = localStorage.getItem(_.storage.lastChange);

    if (!dateStorage) {
      return;
    }

    if (+dateNow - Date.parse(dateStorage) >= _.expireTime * 60000) {
      _.clearCart();
    }
  },

  updateStorage() {
    const _ = this;
    localStorage.setItem(_.storage.count, _.count);
    localStorage.setItem(_.storage.items, _.items);
    localStorage.setItem(_.storage.lastChange, new Date());
  },

  clearCart() {
    const _ = this;
    const cartNode = document.querySelector(_.class.main);
    const addedItems = document.querySelectorAll(`.${_.class.added}`);
    Object.keys(_.storage).forEach(key => localStorage.removeItem(_.storage[key]));

    _.count = 0;
    _.amount.isHide();
    _.items = {};
    _.stringifyItems();

    cartNode.classList.add(_.class.empty);
    cartNode.querySelector(_.class.body).innerHTML = '';

    addedItems.forEach((el) => {
      el.classList.remove(_.class.added);
    });
  },
};

const randomNumber = {
  cache: null,
  get(a, b) {
    // a = start namber; b = end number (not include)
    const self = this;
    let random = Math.random() * (b - a);
    random = Math.floor(random) + a;
    if (random !== self.cache) {
      self.cache = random;
      return random;
    }
    return self.get(a, b);
  },
};

function requestItems(cb) {
  const request = new XMLHttpRequest();
  request.open(
    'GET',
    `https://ma-cats-api.herokuapp.com/api/cats?page=${setting.jsonPage}&per_page=${
      setting.jsonPerPage
    }`,
    true,
  );
  request.onload = () => {
    if (request.status >= 200 && request.status < 400) {
      const data = JSON.parse(request.responseText);
      cb(data);
      setting.jsonPage += 1;
    }
  };

  request.onerror = () => 'Unable to load resources...';
  request.send();
}

function handleClick() {
  const index = this.getAttribute('data-index');
  const name = this.querySelector('.cat__name').textContent;
  cart.addItem(index, name);
}

const lazyLoad = {
  imgClass: 'cat__no-image',
  offset: 300,

  init() {
    document.addEventListener('scroll', this.checkImage.bind(this));
  },

  checkImage() {
    const items = document.querySelectorAll(`.${this.imgClass}`);
    const self = this;
    if (!items.length) {
      // All images loaded
      return;
    }

    items.forEach((img) => {
      const topImg = img.getBoundingClientRect().top;
      const bottomWindow = document.documentElement.clientHeight;
      if (topImg - bottomWindow <= self.offset) {
        self.loadImage(img);
      }
    });
  },

  loadImage(img) {
    const dataSrc = img.dataset.src;
    if (dataSrc) {
      img.setAttribute('src', dataSrc);
      img.setAttribute('data-src', '');
      img.classList.remove(this.imgClass);
    }
  },
};

function createItem(data) {
  const item = document.getElementById('cat-template').content.firstElementChild.cloneNode(true);

  item.querySelector('.cat__name').innerHTML = data.name;
  item.querySelector('.cat__category').innerHTML = data.category;
  item.querySelector('.cat__price').innerHTML = (data.price / 100.00).toFixed(2);
  item.querySelector('.cat__img').setAttribute('alt', `${data.name} img`);
  item.querySelector('.cat__photo').style.backgroundColor = setting.color[randomNumber.get(0, 7)];
  item.dataset.index = `#${data.id}`;
  item.querySelector('.cat__img').dataset.src = data.img_url;

  if (cart.items[item.dataset.index]) {
    item.classList.add(cart.class.added);
  }

  item.addEventListener('click', handleClick);

  return item;
}

function createItems(data) {
  data.cats.forEach((cat) => {
    const newCat = createItem(cat);
    document.querySelector('.catalog').appendChild(newCat);
  });
  lazyLoad.checkImage();
}

const infinityScroll = {
  scrollClass: '.js-on-scroll',
  scrollZone: {},
  scrollOffset: 0,
  throttling: 250,

  init() {
    this.setNextScroll();
  },

  setOffset() {
    this.scrollOffset = this.scrollZone.dataset.offset;
  },

  setScrollZone() {
    const scrollZone = document.querySelector(this.scrollClass);
    this.scrollZone = scrollZone || null;
  },

  setNextScroll() {
    const self = this;
    window.onload = () => {
      self.setScrollZone();
      if (!self.scrollZone) return;
      if (!self.scrollOffset) self.setOffset();
      self.eventScroll();
    };
  },

  eventScroll() {
    document.addEventListener(
      'scroll',
      this.throttle(this.onScrollZone.bind(this), this.throttling),
    );
  },

  throttle(func, limit) {
    let inThrottle;
    const self = this.throttle;
    return (...args) => {
      const context = self;
      if (!inThrottle) {
        inThrottle = true;
        setTimeout(() => {
          func.apply(context, ...args);
          inThrottle = false;
        }, limit);
      }
    };
  },

  onScrollZone() {
    const elementTop = this.getScrollTop();
    if (elementTop >= -this.scrollOffset) {
      requestItems(createItems);
    }
  },

  getScrollTop() {
    const scrollTop = this.scrollZone.getBoundingClientRect().y;
    const screenHeight = document.documentElement.clientHeight;
    return screenHeight - scrollTop;
  },
};

const toggleHeader = {
  /* START User Setting */
  headerClass: '.header',
  offsetHeader: 200,
  offsetTop: 1000,
  throttling: 250,
  animationDuration: 300,
  /* END User Setting */

  headerNode: {},
  isHide: false,
  coordY: 0,

  init() {
    this.headerNode = document.querySelector(this.headerClass);
    document.addEventListener('scroll', this.throttle(this.eventScroll.bind(this)));
  },

  eventScroll() {
    const currentTop = document.body.getBoundingClientRect().y;

    if (currentTop < this.coordY
        && !this.isHide
        && currentTop < 0 - this.offsetTop) {
      this.hideHeader();
    } else if (currentTop > this.coordY && this.isHide) {
      this.showHeader();
    }
    this.coordY = currentTop;

    // fix hidden header for very fast scroll down-up
    setTimeout(() => {
      const bodyTop = -(document.body.getBoundingClientRect().y);
      if (bodyTop < this.offsetTop && this.isHide) {
        this.showHeader();
      }
    }, this.animationDuration);
  },

  hideHeader() {
    this.headerNode.style.top = `-${this.offsetHeader}px`;
    this.isHide = true;
  },

  showHeader() {
    this.headerNode.style.top = '';
    this.isHide = false;
  },

  throttle(func) {
    const context = this.throttle;
    const limit = this.throttling;
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        func.apply(context, ...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  },
};

/* START CODE TO REFACTOR */
const page = document.querySelector('.catalog');
const dropable = document.querySelector('.dropable');
const classSmooth = 'catalog_smooth';
let dragObject = {};
let dropZone;

function smoothPage() {
  page.classList.add(classSmooth);
  page.dataset.smooth = true;
}

function unsmoothPage() {
  page.classList.remove(classSmooth);
  page.dataset.smooth = '';
}

function createAvatar() {
  const avatar = dragObject.elem;
  const old = {
    parent: avatar.parentNode,
    nextSibling: avatar.nextSibling,
    position: avatar.position || '',
    left: avatar.left || '',
    top: avatar.top || '',
    zIndex: avatar.zIndex || '',
  };

  avatar.rollback = () => {
    old.parent.insertBefore(avatar, old.nextSibling);
    avatar.style.position = old.position;
    avatar.style.left = old.left;
    avatar.style.top = old.top;
    avatar.style.zIndex = old.zIndex;
  };

  return avatar;
}

function getCoords(elem) {
  const box = elem.getBoundingClientRect();

  return {
    top: box.top + window.pageYOffset,
    left: box.left + window.pageXOffset,
  };
}

function startDrag() {
  const { avatar } = dragObject;

  document.body.appendChild(avatar);
  avatar.style.zIndex = 9999;
  avatar.style.position = 'absolute';
}

function findDroppable(e) {
  dragObject.avatar.style.display = 'none';
  const elem = document.elementFromPoint(e.clientX, e.clientY);
  dragObject.avatar.style.display = '';
  if (elem == null) return null;

  return elem.closest('.dropable');
}

function finishDrag(e) {
  const dropItem = findDroppable(e);

  if (dropItem) {
    const index = dragObject.avatar.getAttribute('data-index');
    const name = dragObject.avatar.querySelector('.cat__name').textContent;
    cart.addItem(index, name);

    dragObject.avatar.rollback();
    dragObject = {};
    unsmoothPage();
  } else {
    dragObject.avatar.rollback();
    dragObject = {};
  }
}

document.addEventListener('mousedown', (e) => {
  if (e.which !== 1) return;

  const elem = e.target.closest('.cat');
  if (!elem) return;
  for (let i = 0; i < elem.classList.length; i += 1) {
    if (elem.classList[i] === 'cat_added') return;
  }

  dragObject.elem = elem;
  dragObject.downX = e.pageX;
  dragObject.downY = e.pageY;
  e.preventDefault();
  toggleHeader.showHeader();
});

document.addEventListener('mousemove', (e) => {
  if (!dragObject.elem) return;

  if (!dragObject.avatar) {
    const moveX = e.pageX - dragObject.downX;
    const moveY = e.pageY - dragObject.downY;
    if (Math.abs(moveX) < 10 && Math.abs(moveY) < 10) return;

    dragObject.avatar = createAvatar(e);
    if (!dragObject.avatar) {
      dragObject = {};
      return;
    }

    const coords = getCoords(dragObject.avatar);
    dragObject.shiftX = dragObject.downX - coords.left;
    dragObject.shiftY = dragObject.downY - coords.top;
    dropZone = document.querySelector('.dropable').getBoundingClientRect();

    startDrag(e);
  }

  dragObject.avatar.style.left = `${e.pageX - dragObject.shiftX}px`;
  dragObject.avatar.style.top = `${e.pageY - dragObject.shiftY}px`;

  dropable.style.visibility = 'visible';

  if (
    e.clientX > dropZone.x
    && e.clientX < dropZone.x + dropZone.width
    && e.clientY > dropZone.y
    && e.clientY < dropZone.y + dropZone.height
  ) {
    if (!page.dataset.smooth) {
      smoothPage();
    }
  } else if (page.dataset.smooth) {
    unsmoothPage();
  }
});

document.addEventListener('mouseup', (e) => {
  if (dragObject.avatar) finishDrag(e);

  dropable.style.visibility = '';
  dragObject = {};
});

/* END CODE TO REFACTOR */

cart.init({ expireTime: 10 });
requestItems(createItems);
infinityScroll.init();
lazyLoad.init();
toggleHeader.init();
