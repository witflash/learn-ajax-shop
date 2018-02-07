'use strict';
// @TODO
// LocalStorage
// if not get than 0, if set than set key
// add expired
var cartCount = 0;
var cart = {};

// @TODO
// show object as a string
// cart.toString

/**
 * Request data from json file 
 * @param {Function} cb - add items on page
 */
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
	let item = document.getElementById('cat-template').children[0].cloneNode(true);

	item.querySelector('.cat__name').innerHTML = data.name;
	item.querySelector('.cat__category').innerHTML = data.category;
	item.querySelector('.cat__price').innerHTML = data.price;
	item.querySelector('.cat__img').setAttribute("src", data.img_url);
	item.setAttribute("data-index", index);

	item.addEventListener('click', handleClick);

	return item;
}

function handleClick() {
	var index = this.getAttribute('data-index');
	addToCart(index);
}

function addToCart(index) {
	// increase cart count
	cartCount++;
	document.querySelector('.js-cart-amount').textContent = cartCount;
	index = '#' + index;	
	if (cart[index]) {
		cart[index]++;
	} else {
		cart[index] = 1;
	};	
}

function cartOpen() {
	// @TODO
	// add modal window with nice view
	alert(cart);
}

// @TODO learn how to write eventListener (iLya)
//eventListening('click', init.cartOpen(){});
//document.addEventListener('click',cartOpen());
document.querySelector('.js-cart-open').addEventListener('click', cartOpen);

requestItems(createItems);

// @TODO
// add template for cart items
// with increase count/decrease count/remove (+)(x)
// input type="number"
// BEST: custom (-)______(+) (x)