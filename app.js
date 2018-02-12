'use strict';

const _setting = {
	jsonPage: 1,
	jsonPerPage: 30,
	emptyCartText: "No item in the cart :(<br>Please add the item(s) to the catalog.",
};

const _storage = {
	get: {
		cart: localStorage.getItem('userCartList'),
		count: localStorage.getItem('userCartCount')
	},
	set: {
		cart: function (list) {
			localStorage.setItem('userCartList', list)
		},
		count: function(value) {
			localStorage.setItem('userCartCount', value)
		}
	},
	lastChange: new Date()
};

const cart = {
	count: 0,
	body: document.querySelector('.cart__body'),
	itemTemplate: document.getElementById('cart-item-template').firstElementChild,

	amount: {
		bubble: document.querySelector('.js-cart-amount'),
		isVisible: function () {
			this.bubble.classList.add('amount_visible');
		}
	},
	
	items: {},

	init: function() {
		let nodeToggle = document.querySelector('.js-cart-toggle');
		let nodeClose = document.querySelector('.js-cart-close');
		if (_storage.get.count) {
			this.count = _storage.get.count;
			this.amount.bubble.textContent = this.count;			
			this.amount.isVisible();
		}
		if (_storage.get.cart) {
			this.items = JSON.parse(_storage.get.cart);
			for (let id in this.items) {
				this.renderItem(id, this.items[id].name, this.items[id].amount);
			}
		};
		this.items.toString = function() {
			return JSON.stringify(this)
		};

		if (!this.count) {
			this.body.innerHTML = _setting.emptyCartText;
		};
		nodeToggle.addEventListener('click', this.toggle);
		nodeClose.addEventListener('click', this.toggle);
	},

	addItem: function (index, name) {
		console.log('this', this)
		this.count++;
		_storage.set.count(this.count);
		this.amount.bubble.textContent = this.count;
		this.amount.isVisible();		
		index = '#' + index;
		if (this.items[index]) {
			this.items[index].amount++;
			this.renderItemAmount(this.items[index].amount, index);
		} else {
			this.items[index] = {'name': name, 'amount': 1};
			this.renderItem(index, name, 1);
		};
		_storage.set.cart(this.items.toString());
	},

	renderItemAmount: function (amount, index) {
		let cartItem = document.querySelector('[data-cart-index=\"' + index + '\"]');
		cartItem.querySelector('.cart__amount').innerHTML = amount;
	},

	renderItem: function (index, name, amount) {
		let cartItem = this.itemTemplate.cloneNode(true);
		cartItem.dataset.cartIndex = index;
		cartItem.querySelector('.cart__name').innerHTML = name;
		cartItem.querySelector('.cart__amount').innerHTML = amount;
		
		if (this.body.innerHTML == _setting.emptyCartText) {
			this.body.innerHTML = '';
		} 
		this.body.appendChild(cartItem);
	},

	toggle: function () {
		let cartWindow = document.querySelector('.cart');
		cartWindow.classList.toggle('cart_visible');	
	}
};

function requestItems(cb) {
	var request = new XMLHttpRequest();
	request.open('GET', `https://ma-cats-api.herokuapp.com/api/cats?page=${_setting.jsonPage}&per_page=${_setting.jsonPerPage}`, true);
	request.onload = function () {
		if (request.status >= 200 && request.status < 400) {
			var data = JSON.parse(request.responseText);
			cb(data);
			_setting.jsonPage++;
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
cart.init();
infinityScroll.init();