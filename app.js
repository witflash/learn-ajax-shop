////////////////////
//    GET JSON    //
////////////////////

var request = new XMLHttpRequest();
request.open('GET', 'data.json', true);
request.onload = function() {
  if (request.status >= 200 && request.status < 400) {
    // Success!
		var data = JSON.parse(request.responseText);
		
  } else {
		// We reached our target server, but it returned an error
  }
	data.cats.forEach(cat => {
		let newCat = createCat(cat);
		document.querySelector('.catalog').appendChild(newCat);
	});
};
request.onerror = function() {
};
request.send();


//////////////////////////
//    BUILD CAT ITEM    //
//////////////////////////

function createCat(data) {
	let template = document.getElementById('cat-wrapper').children[0].cloneNode(true);

	template.querySelector('.cat__name').innerHTML = data.name;
	template.querySelector('.cat__category').innerHTML = data.category;
	template.querySelector('.cat__price').innerHTML = data.price;
	template.querySelector('.cat__photo').children[0].setAttribute("src", data.img_url);

	return template;
}





// var cats = document.querySelectorAll('[data-cat]');
// console.log(cats);

// cats.forEach( function(item, i) {
// 	item.addEventListener
// })










///////////////////
//  BURGER MENU  //
///////////////////

(function ($, window, document) {

	$(function () {
	  menu.init();
	});
  
	var menu = {
	  $el : $('.js-menu'),
	  triggerClass: '.js-menu-trigger',
	  init: function() {
		if (!this.$el.length) return;
		$(this.triggerClass).on('click', this.toggle);
		this.clone();
	  },
	  toggle: function() {
		$('html').toggleClass('menu-open');
	  },
	  clone: function() {
			var menuMobile = '.js-mobile-menu',
				menuItems = '.js-menu-item',
				wrapper = 'menu-m__item';
		
			$(menuItems).clone()
						.sort(compare)
						.removeClass()
						.addClass(wrapper)
						.appendTo(menuMobile);
		
			function compare(a, b) {
				return ($(a).data('menu-order') - $(b).data('menu-order'));
			}
	  }
	}
}(window.jQuery, window, document));