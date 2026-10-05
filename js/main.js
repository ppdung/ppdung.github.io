;(function () {
	
	'use strict';



	// The hero used to be pinned to the window height in JS (fullHeight, on
	// desktop user agents only). In a short window -- 400% zoom on a laptop
	// is 320x180 CSS px -- the content was centred in a box smaller than
	// itself and the name and role spilled off the top, out of reach. CSS
	// now sizes it: .hero-content has min-height:100vh and grows with its
	// content.


	// Reveal-on-scroll.
	//
	// The previous implementation collected every box that had crossed the
	// waypoint into one pending queue and then delayed each by its index into
	// that queue times 200ms. Scrolling quickly to the footer put forty-odd
	// boxes in the queue at once, so the last of them was scheduled eight
	// seconds out: the reader arrived at the bottom of the page and waited,
	// watching content trickle in. It also only fired on direction === 'down',
	// so anything scrolled up to that had never been revealed stayed hidden.
	//
	// IntersectionObserver reveals on entry regardless of direction, and the
	// stagger is per-callback and capped, so the worst case is ~210ms no
	// matter how fast the page is flung about.
	var revealOnScroll = function () {
		// Tells the failsafe in <head> that the reveal is alive, so it does not
		// strip the class that hides the boxes.
		window.__revealReady = true;

		var boxes = Array.prototype.slice.call(document.querySelectorAll('.animate-box'));
		if (!boxes.length) { return; }

		function reveal(el, delay) {
			if (delay > 0) {
				setTimeout(function () { el.classList.add('is-visible'); }, delay);
			} else {
				el.classList.add('is-visible');
			}
		}

		// Without IntersectionObserver, show everything rather than hide it.
		if (!('IntersectionObserver' in window)) {
			boxes.forEach(function (el) { reveal(el, 0); });
			return;
		}

		var STAGGER_MS = 70;
		var MAX_STEPS = 3;
		var pending = boxes.slice();

		// Anything the reader has already scrolled clear of is shown at once,
		// with no animation to catch up on. Without this, landing on the
		// footer -- by fling, by anchor, by restored scroll position -- leaves
		// every box above that point hidden until it is scrolled back to.
		function sweepPassed() {
			pending = pending.filter(function (el) {
				if (el.classList.contains('is-visible')) { return false; }
				if (el.getBoundingClientRect().bottom < 0) {
					el.classList.add('is-visible');
					observer.unobserve(el);
					return false;
				}
				return true;
			});
		}

		var observer = new IntersectionObserver(function (entries) {
			var shown = 0;
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) { return; }
				reveal(entry.target, Math.min(shown, MAX_STEPS) * STAGGER_MS);
				shown++;
				observer.unobserve(entry.target);
			});
			sweepPassed();
		}, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });

		pending.forEach(function (el) { observer.observe(el); });

		// Backstop for scrolls that outrun the observer.
		var ticking = false;
		window.addEventListener('scroll', function () {
			if (ticking) { return; }
			ticking = true;
			window.requestAnimationFrame(function () {
				sweepPassed();
				ticking = false;
			});
		}, { passive: true });
	};

	var burgerMenu = function() {

		$('.js-colorlib-nav-toggle').on('click', function(event){
			event.preventDefault();
			var $this = $(this);

			if ($('body').hasClass('offcanvas')) {
				$this.removeClass('active');
				$('body').removeClass('offcanvas');	
			} else {
				$this.addClass('active');
				$('body').addClass('offcanvas');	
			}
		});



	};

	// Click outside of offcanvass
	var mobileMenuOutsideClick = function() {

		$(document).click(function (e) {
	    var container = $("#colorlib-aside, .js-colorlib-nav-toggle");
	    if (!container.is(e.target) && container.has(e.target).length === 0) {

	    	if ( $('body').hasClass('offcanvas') ) {

    			$('body').removeClass('offcanvas');
    			$('.js-colorlib-nav-toggle').removeClass('active');
			
	    	}
	    	
	    }
		});

		$(window).scroll(function(){
			if ( $('body').hasClass('offcanvas') ) {

    			$('body').removeClass('offcanvas');
    			$('.js-colorlib-nav-toggle').removeClass('active');
			
	    	}
		});

	};

	var clickMenu = function() {

		$('#navbar a:not([class="external"])').click(function(event){
			// The links point at real #section fragments, so a click with a
			// modifier (open in a new tab or window) is left to the browser.
			if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button) {
				return;
			}
			var section = $(this).data('nav-section'),
				navbar = $('#navbar');

				if ( $('[data-section="' + section + '"]').length ) {
			    	$('html, body').animate({
			        	scrollTop: $('[data-section="' + section + '"]').offset().top - 55
			    	}, 500);
			   }

		    if ( navbar.is(':visible')) {
		    	navbar.removeClass('in');
		    	navbar.attr('aria-expanded', 'false');
		    	$('.js-colorlib-nav-toggle').removeClass('active');
		    }

		    event.preventDefault();
		    return false;
		});


	};

	// Reflect scrolling in navigation
	var navActive = function(section) {

		var $el = $('#navbar > ul');
		$el.find('li').removeClass('active');
		$el.each(function(){
			$(this).find('a[data-nav-section="'+section+'"]').closest('li').addClass('active');
		});

		// Keep the language switch on the section being read, so switching
		// mid-page lands in the same place (/#projects -> /vi/#projects).
		// Both pages use the same section ids, so this works both ways.
		var langLink = document.querySelector('.lang-switch a');
		if (langLink && section) {
			langLink.hash = section === 'home' ? '' : section;
		}

	};

	var navigationSection = function() {

		var $section = $('section[data-section]');
		
		$section.waypoint(function(direction) {
		  	
		  	if (direction === 'down') {
		    	navActive($(this.element).data('section'));
		  	}
		}, {
	  		offset: '150px'
		});

		$section.waypoint(function(direction) {
		  	if (direction === 'up') {
		    	navActive($(this.element).data('section'));
		  	}
		}, {
		  	offset: function() { return -$(this.element).height() + 155; }
		});

	};


	// Document on load.
	$(function(){
		revealOnScroll();
		burgerMenu();
		clickMenu();
		navigationSection();
		mobileMenuOutsideClick();
	});


}());
