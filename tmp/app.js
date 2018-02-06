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
		// $(document).trigger("menu:open");
	  },
	  clone: function() {
		// @todo: clone all elements
		// dynamic markup
		// sort by data-menu-order
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
		// var itemMobile = '<div class="menu-m__item">' + $(this).html() + '</div>';
		
		
  
	  }
	}
  
	// $(document).on('menu:open', function(){
	//   console.log('MAGIC WOW');
	// });
	
  }(window.jQuery, window, document));