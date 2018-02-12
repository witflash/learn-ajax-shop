'use strict';

var setting = {
	jsonPage: 1,
	jsonPerPage: 30
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
	item.dataset.index = data.id;

	item.addEventListener('click', handleClick);

	return item;
}

function createCartItem (index, name, amount) {
	let cartItem = document.getElementById('cart-item-template').firstElementChild.cloneNode(true);
	let cartBody = document.querySelector('.cart__body');

	cartItem.dataset.cartIndex = index;
	cartItem.querySelector('.cart__name').innerHTML = name;
	cartItem.querySelector('.cart__amount').innerHTML = amount;
	
	if (cartBody.innerHTML == emptyCartText) {
		cartBody.innerHTML = '';
	} 
	cartBody.appendChild(cartItem);
}

function renderCartAmount (amount, index) {
	let cartItem = document.querySelector('[data-cart-index=\"' + index + '\"]');
	cartItem.querySelector('.cart__amount').innerHTML = amount;
}

function handleClick() {
	let index = this.getAttribute('data-index');
	let name = this.querySelector('.cat__name').textContent;
	addToCart(index, name);
}

function addToCart(index, name) {
	cartCount++;
	localCache.set.count(cartCount);
	document.querySelector('.js-cart-amount').textContent = cartCount;
	index = '#' + index;	
	if (cart[index]) {
		cart[index].amount++;
		renderCartAmount(cart[index].amount, index);
	} else {
		cart[index] = {'name': name, 'amount': 1};
		createCartItem(index, name, 1);
	};
}

function cartToggle() {
	let cartWindow = document.querySelector('.cart');
	cartWindow.classList.toggle('cart_visible');	
}


// @TODO
// LocalStorage
// if not get than 0, if set than set key
// add expired

// localStorage.clear();

var localCache = {
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
	}
}


var emptyCartText = "No item in the cart :(<br>Please add the item(s) in the catalog.";
var cartCount = localCache.get.count || 0;

var cart = {
	toString: function() {
		return JSON.stringify(this)
	}
};

if (!cartCount) {
	document.querySelector('.cart__body').innerHTML = emptyCartText;
};


requestItems(createItems);
document.querySelector('.js-cart-toggle').addEventListener('click', cartToggle);
document.querySelector('.js-cart-close').addEventListener('click', cartToggle);


// @TODO
// show object as a string
// cart.toString

// @TODO
// add template for cart items
// with increase count/decrease count/remove (+)(x)
// input type="number"
// BEST: custom (-)______(+) (x)


var infinityScroll = {
	scrollClass: '.js-on-scroll',
	scrollZone: {},
	scrollOffset: 0,
	
	init: function() {
		this.setNextScroll();
	},
	
	setOffset: function() {
		this.scrollOffset = this.scrollZone.dataset.offset;
	},
	
	setScrollZone: function() {
		let allZones = document.querySelectorAll(this.scrollClass);
		if (allZones) {
			this.scrollZone = allZones[allZones.length - 1];
		} else {
			this.scrollZone = null;
		}
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
		document.addEventListener('scroll', this.throttle(this.onScrollZone.bind(this), 250));
	},

	throttle: function (func, limit) {
		let inThrottle;
		console.log(this)
		let self = this.throttle;
		return function () {
			const args = arguments;
			const context = self;
			console.log('inThrottle', inThrottle)
			if (!inThrottle) {
				// setTimeout(func, limit);
				// inThrottle = true;
				// console.log('inThrottle', inThrottle)
				func.apply(context, args);
				inThrottle = true;
				setTimeout(() => inThrottle = false, limit);
			} 
			// else {
			// 	clearTimeout(func, limit);
			// 	console.log('Throttling...')
			// 	inThrottle = false;
			// }
		}
	},

	getScrollTop: function() {
		let scrollTop = this.scrollZone.getBoundingClientRect().y;
		let screenHeight = document.documentElement.clientHeight;
		return screenHeight - scrollTop;
	},

	onScrollZone: function() {
		console.log('this', this)
		let elementTop = this.getScrollTop();
		console.log('elementTop', elementTop);
		if (elementTop >= -this.scrollOffset) {
			// document.removeEventListener('scroll', this.onScrollZone);
			// console.log('Remove Event Listener');
			requestItems(createItems);			
			// this.loadContent();
			// this.setNextScroll();
		}
	},

	// moveScroll: function() {
	// 	let self = this;
	// 	let currentScroll = document.querySelector(this.scrollClass);
	// 	let newScroll = currentScroll.cloneNode();
	// 	currentScroll.remove();
	// 	window.onload = function() {
	// 		console.log('All resources loaded');
	// 		document.querySelector('main').appendChild(self.moveScroll.newScroll);
	// 		};
	// },
	
	// loadContent: function() {
	// 	requestItems(createItems);
		// this.moveScroll();
	// }
}

// function loadMoreContent() {
// 	let bodyContent = document.querySelector('main');
// 	let nextContent = document.querySelector('.catalog').cloneNode(true);
// }


infinityScroll.init();