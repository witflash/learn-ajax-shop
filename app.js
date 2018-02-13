'use strict';

const setting = {
	jsonPage: 1,
	jsonPerPage: 30,
};

const cart = {
	count: 0,
	items: {},
	expireTime: 1000, // default value
	
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
		visible: 'cart_visible',
		empty: 'cart_empty',
		itemTemplate: 'cart-item-template'
	},

	storage: {
		items: 'userCartList',
		count: 'userCartCount',
		lastChange: 'lastCartChange'
	},

	amount: {
		bubble: document.querySelector('.js-cart-amount'),
		isVisible: function () {
			this.bubble.classList.add('amount_visible');
		},
		isHide: function () {
			this.bubble.classList.remove('amount_visible');
		}
	},
	

	init: function(args) {
		let _ = this;
		let nodeToggle = document.querySelector(_.class.toggle);
		let nodeClose = document.querySelector(_.class.close);
		let nodeRemove = document.querySelector(_.class.remove);
		_.applyUserArgs(args);
		_.checkExpire();
		
		if (localStorage.getItem(_.storage.count)) {
			_.count = localStorage.getItem(_.storage.count);
			_.amount.bubble.textContent = _.count;			
			_.amount.isVisible();
			_.items = JSON.parse(localStorage.getItem(_.storage.items));
			for (let id in _.items) {
				_.renderItem(id, _.items[id].name, _.items[id].amount);
			}
		}
		
		_.stringifyItems();

		if (_.count) {
			document.querySelector(_.class.main).classList.remove(_.class.empty);
		};
		
		nodeToggle.addEventListener('click', _.toggle.bind(this));
		nodeClose.addEventListener('click', _.toggle.bind(this));
		nodeRemove.addEventListener('click', _.clearCart.bind(this));
	},
	
	stringifyItems: function () {
		this.items.toString = function() {
			return JSON.stringify(this)
		};
	},

	reset: function () {
		let _ = this;
		_.count = 0;
		_.amount.isHide;
		_.items = {};
		_.stringifyItems();
	},

	addItem: function (index, name) {
		let _ = this;
		index = '#' + index;

		if (_.items[index]) {
			_.items[index].amount++;
			_.renderItemAmount(_.items[index].amount, index);
		} else {
			_.items[index] = {'name': name, 'amount': 1};
			_.renderItem(index, name, 1);
		};

		_.count++;
		localStorage.setItem(_.storage.count, _.count);
		_.amount.bubble.textContent = _.count;
		_.amount.isVisible();	
				
		localStorage.setItem(_.storage.items, _.items);
		localStorage.setItem(_.storage.lastChange, new Date());
	},

	renderItemAmount: function (amount, index) {
		let cartItem = document.querySelector('[data-cart-index=\"' + index + '\"]');
		cartItem.querySelector(this.class.amount).innerHTML = amount;
	},

	renderItem: function (index, name, amount) {
		let _ = this;		
		let cartItem = document.getElementById(_.class.itemTemplate).firstElementChild.cloneNode(true);
		let decrease = cartItem.querySelector(_.class.decrease);
		let increase = cartItem.querySelector(_.class.increase);
		cartItem.dataset.cartIndex = index;
		cartItem.querySelector(_.class.name).innerHTML = name;
		cartItem.querySelector(_.class.amount).innerHTML = amount;
		document.querySelector(_.class.main).classList.remove(_.class.empty);

		decrease.addEventListener('click', _.decrease.bind(this, cartItem));
		increase.addEventListener('click', _.increase.bind(this, cartItem));

		document.querySelector(_.class.body).appendChild(cartItem);
	},

	decrease: function (cartItem) {
		let _ = this;
		let index = cartItem.dataset.cartIndex;
		if (_.items[index].amount > 1) {
			_.count--;
			_.items[index].amount--;
			
			localStorage.setItem(_.storage.count, _.count);
			_.amount.bubble.textContent = _.count;
			_.renderItemAmount(_.items[index].amount, index);
			localStorage.setItem(_.storage.items, _.items);
			localStorage.setItem(_.storage.lastChange, new Date());				
		}
	},

	increase: function (cartItem) {
		let _ = this;
		let index = cartItem.dataset.cartIndex;
		if (_.items[index].amount >= 20) {
			return
		}

		_.count++;
		_.items[index].amount++;
		
		localStorage.setItem(_.storage.count, _.count);
		_.amount.bubble.textContent = _.count;
		_.renderItemAmount(_.items[index].amount, index);
		localStorage.setItem(_.storage.items, _.items);
		localStorage.setItem(_.storage.lastChange, new Date());
	},

	toggle: function () {
		let cartWindow = document.querySelector(this.class.main);
		cartWindow.classList.toggle(this.class.visible);	
	},

	applyUserArgs: function (args) {
		if (args) {
			console.log('args', args)
			for (let key in args) {
				this[key] = args[key];
			}
		}
	}, 

	checkExpire: function () {
		let _ = this;
		let dateNow = new Date();
		let dateStorage = localStorage.getItem(_.storage.lastChange);
		
		if (!dateStorage) { return };

		if (+dateNow - Date.parse(dateStorage) >= _.expireTime ) {
			console.log('Cart expired!')
			_.clearCart();
		}
	},

	clearCart: function () {
		let _ = this;
		let cart = document.querySelector(_.class.main);
		for (let key in this.storage) {
			localStorage.removeItem(this.storage[key]);
		};
		_.count = 0;
		_.amount.isHide();
		_.items = {};
		_.stringifyItems();
		
		cart.classList.add(_.class.empty);
		cart.querySelector(_.class.body).innerHTML = '';
	}
};

function requestItems(cb) {
	var request = new XMLHttpRequest();
	request.open('GET', `https://ma-cats-api.herokuapp.com/api/cats?page=${setting.jsonPage}&per_page=${setting.jsonPerPage}`, true);
	request.onload = function () {
		if (request.status >= 200 && request.status < 400) {
			var data = JSON.parse(request.responseText);
			cb(data);
			setting.jsonPage++;
		} else {
		}
	};
	request.onerror = function () {
	};
	request.send();
}

function createItems(data) {
	data.cats.forEach((cat,index) => {
		let newCat = createItem(cat, index);
		document.querySelector('.catalog').appendChild(newCat);
	});
}

function createItem(data, index) {
	let item = document.getElementById('cat-template').firstElementChild.cloneNode(true);

	item.querySelector('.cat__name').innerHTML = data.name;
	item.querySelector('.cat__category').innerHTML = data.category;
	item.querySelector('.cat__price').innerHTML = data.price;
	item.querySelector('.cat__img').setAttribute("src", data.img_url);
	item.querySelector('.cat__img').setAttribute("alt", data.name + ' img');
	item.dataset.index = data.id;

	item.addEventListener('click', handleClick);

	return item;
}

function handleClick() {
	let index = this.getAttribute('data-index');
	let name = this.querySelector('.cat__name').textContent;
	cart.addItem(index, name);
}


// @TODO
// LocalStorage
// add expired

// @TODO
// with increase count/decrease count/remove (+)(x)
// input type="number"
// BEST: custom (-)______(+) (x)


var infinityScroll = {
	scrollClass: '.js-on-scroll',
	scrollZone: {},
	scrollOffset: 0,
	throttling: 250,
	
	init: function() {
		this.setNextScroll();
	},
	
	setOffset: function() {
		this.scrollOffset = this.scrollZone.dataset.offset;
	},
	
	setScrollZone: function() {
		let scrollZone = document.querySelector(this.scrollClass);
		this.scrollZone = scrollZone ? scrollZone : null;
	},
	
	setNextScroll: function() {
		let self = this;
		window.onload = function() {
			self.setScrollZone();
			if (!self.scrollZone) {
				console.log('There is no infinity scroll on the page');
				return;
			}
			if (!self.scrollOffset) {
				self.setOffset();
			};
			self.eventScroll();
		}
	},
	
	eventScroll: function() {
		document.addEventListener('scroll', this.throttle(this.onScrollZone.bind(this), this.throttling));
	},
	
	throttle: function (func, limit) {
		let inThrottle;
		let self = this.throttle;
		return function () {
			const args = arguments;
			const context = self;
			if (!inThrottle) {
				func.apply(context, args);
				inThrottle = true;
				setTimeout(() => inThrottle = false, limit);
			} 
		}
	},
	
	onScrollZone: function() {
		let elementTop = this.getScrollTop();
		if (elementTop >= -this.scrollOffset) {
			requestItems(createItems);			
		}
	},
	
	getScrollTop: function() {
		let scrollTop = this.scrollZone.getBoundingClientRect().y;
		let screenHeight = document.documentElement.clientHeight;
		return screenHeight - scrollTop;
	}
	
}


requestItems(createItems);
cart.init(
	{expireTime: 5000}
);
infinityScroll.init();