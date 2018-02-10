'use strict';

function requestItems(cb) {
	var request = new XMLHttpRequest();
	request.open('GET', 'data.json', true);
	request.onload = function () {
		if (request.status >= 200 && request.status < 400) {
			var data = JSON.parse(request.responseText);
			cb(data);
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