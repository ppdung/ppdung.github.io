/* ==========================================================================
   site.js -- every behaviour on the page, shared by / and /vi/.

   No libraries. This replaces jQuery 2.1.4, Bootstrap 3.3.5's JS, Waypoints,
   Typed.js from cdnjs, the old main.js, and a 470-line inline block that was
   copied into both pages and had started to drift. It also loads Google
   Analytics, which used to be an inline snippet in <head>: the pages run no
   inline script at all, which is what lets their Content-Security-Policy
   refuse it. The only text that differs between the languages is in
   STRINGS below.

   Each feature is set up on its own, inside its own try/catch, so one that
   fails -- a missing element, an API an old browser lacks -- cannot take the
   others down with it. That used to happen: a blocked cdnjs request threw at
   the first line of the inline block and left the project dialogs, the
   contact form and every analytics event dead.

   Nothing here reads layout (offsetTop, scrollHeight, getBoundingClientRect)
   while the page is starting up; positions come from IntersectionObserver and
   ResizeObserver, which report them after layout instead of forcing it.
   ========================================================================== */
;(function () {
	'use strict';

	var doc = document;
	var root = doc.documentElement;
	var body = null;

	var STRINGS = {
		en: {
			showFewer: '- Show fewer',
			showMore: '+ Show {n} more contributions',
			formSent: '✓ Message sent successfully! I will get back to you soon.',
			formFailed: '✗ Failed to send message. Please try again or email me at ',
			collapseSidebar: 'Collapse sidebar',
			expandSidebar: 'Expand sidebar',
			consentUnset: 'You have not chosen yet, so Google Analytics runs without cookies.',
			consentGranted: 'You allowed analytics cookies in this browser.',
			consentDenied: 'You declined, so Google Analytics is off in this browser.'
		},
		vi: {
			showFewer: '- Thu gọn',
			showMore: '+ Xem thêm {n} đóng góp',
			formSent: '✓ Đã gửi tin nhắn! Tôi sẽ phản hồi sớm nhất có thể.',
			formFailed: '✗ Gửi không thành công. Vui lòng thử lại hoặc email trực tiếp cho tôi qua ',
			collapseSidebar: 'Thu gọn thanh bên',
			expandSidebar: 'Mở rộng thanh bên',
			consentUnset: 'Bạn chưa chọn, nên Google Analytics đang chạy mà không dùng cookie.',
			consentGranted: 'Bạn đã cho phép cookie thống kê trên trình duyệt này.',
			consentDenied: 'Bạn đã từ chối, nên Google Analytics đã tắt trên trình duyệt này.'
		}
	};
	var T = STRINGS[(root.getAttribute('lang') || 'en').slice(0, 2)] || STRINGS.en;

	var CONTACT_EMAIL = 'dung.phamphuoc308@gmail.com';

	// ------------------------------------------------------------------
	// Small helpers
	// ------------------------------------------------------------------
	function each(list, fn) { Array.prototype.forEach.call(list, fn); }

	function media(query) {
		return window.matchMedia ? window.matchMedia(query) : { matches: false };
	}

	function onMediaChange(mq, fn) {
		if (mq.addEventListener) { mq.addEventListener('change', fn); }
		else if (mq.addListener) { mq.addListener(fn); }
	}

	var reducedMotion = media('(prefers-reduced-motion: reduce)');

	// The CSS reduce block cannot stop a scroll that script asks to be
	// smooth, so every programmatic scroll goes through this.
	function scrollBehavior() { return reducedMotion.matches ? 'auto' : 'smooth'; }

	// Below 993px the sidebar is off-canvas behind the hamburger (css/style.css,
	// "Sidebar on tablets and short laptop screens").
	var offcanvasLayout = media('(max-width: 992px)');

	// Browsers that refuse site data -- Safari's private mode, blocked cookies,
	// some managed profiles -- throw on any localStorage access.
	var store = {
		get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
		set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* not fatal */ } }
	};

	// GA4. Calls made before gtag.js arrives wait in dataLayer and go out
	// with it; if this file's analytics setup failed, gtag is missing and
	// this does nothing.
	function track(name, params) {
		if (typeof window.gtag === 'function') {
			window.gtag('event', name, params || {});
		}
	}

	// Focus without scrolling, for a heading or another element outside the
	// Tab order: tabindex=-1 makes it focusable, and css/style.css shows no
	// ring there unless the move came from the keyboard.
	function focusQuietly(el) {
		if (!el) { return; }
		if (!el.hasAttribute('tabindex')) { el.setAttribute('tabindex', '-1'); }
		try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
	}

	// Where focus goes when the control that had it disappears -- a button
	// in the consent notice once a choice is made, or a dialog's opener that
	// has gone. Left alone it fell to <body>: screen readers lost their place,
	// and some browsers start Tab again from the top of the page. This is the
	// heading of the section being read (the one whose top has passed 30% of
	// the viewport), so the next Tab carries on from there. It reads layout,
	// so it runs on a click or a key, never while the page starts up.
	function focusReadingPosition() {
		var sections = doc.querySelectorAll('section[data-section]');
		var line = (window.innerHeight || root.clientHeight) * 0.3;
		var current = sections[0] || null;
		each(sections, function (s) {
			if (s.getBoundingClientRect().top <= line) { current = s; }
		});
		if (current) { focusQuietly(current.querySelector('h1, h2') || current); }
	}

	// Features talk to each other through these; each is replaced with the
	// real thing when its feature starts, so a feature that failed to start
	// leaves a harmless stub behind.
	var menu = { isOpen: function () { return false; }, close: function () {}, syncInert: function () {} };
	var dialogs = { open: function () {}, close: function () {} };
	var analytics = { choice: function () { return null; }, choose: function () {} };
	var revealNow = function () {};

	// ------------------------------------------------------------------
	// Reveal on scroll
	//
	// Only boxes that are entirely below the fold when the page first lays
	// out are ever hidden, and only once that is known, so the content is
	// never hidden by markup or by CSS alone. If this file does not arrive
	// or throws, nothing is hidden at all; the <head> failsafe that used to
	// paper over that is gone.
	//
	// One observer does both jobs. Its root reaches far above the viewport:
	// a box that enters at the bottom fades in, and a box that is jumped
	// over (a fling, End, an anchor) counts as intersecting the moment it is
	// above the screen, and is shown at once with no animation to catch up on.
	// ------------------------------------------------------------------
	function initReveal() {
		var boxes = doc.querySelectorAll('.animate-box');
		if (!boxes.length || !('IntersectionObserver' in window) || reducedMotion.matches) { return; }

		var STAGGER_MS = 70;
		var MAX_STEPS = 3;
		var classified = [];

		function show(el, delay) {
			if (delay < 0) { el.classList.add('reveal-instant'); }
			else if (delay > 0) { el.style.transitionDelay = delay + 'ms'; }
			el.classList.add('is-visible');
		}

		var observer = new IntersectionObserver(function (entries) {
			var step = 0;
			var viewportHeight = window.innerHeight || root.clientHeight;
			entries.forEach(function (entry) {
				var el = entry.target;
				var box = entry.boundingClientRect;

				// First report for this box: decide whether it is hidden at all.
				if (classified.indexOf(el) === -1) {
					classified.push(el);
					if (!entry.isIntersecting && box.top >= viewportHeight) {
						el.classList.add('reveal-armed');
					} else {
						observer.unobserve(el);
					}
					return;
				}

				if (!entry.isIntersecting) { return; }
				observer.unobserve(el);
				show(el, box.bottom <= 0 ? -1 : Math.min(step++, MAX_STEPS) * STAGGER_MS);
			});
		}, { rootMargin: '100000px 0px -8% 0px', threshold: 0 });

		each(boxes, function (el) { observer.observe(el); });

		// A section jump shows everything in the section it lands on, so the
		// reader does not arrive at a blank section and wait for it to fade in.
		revealNow = function (scope) {
			each(scope.querySelectorAll('.reveal-armed:not(.is-visible)'), function (el) {
				observer.unobserve(el);
				show(el, -1);
			});
		};
	}

	// ------------------------------------------------------------------
	// Role line in the hero
	//
	// The heading's text is the full static list (visually hidden), so a
	// screen reader or a crawler always gets every role. The visible line is
	// a separate aria-hidden span that starts on the first role. Unless the
	// reader asked for reduced motion, it types once through the other roles
	// and back to the first, then stops: the whole run fits inside five
	// seconds (WCAG 2.2.2), with no cursor left blinking afterwards.
	// ------------------------------------------------------------------
	function initTyping() {
		var out = doc.querySelector('.hero-typed');
		var items = doc.querySelectorAll('.hero-roles > span');
		if (!out || items.length < 2 || reducedMotion.matches) { return; }

		var roles = Array.prototype.map.call(items, function (s) { return s.textContent.trim(); });
		var sequence = roles.slice(1).concat(roles[0]);

		// The line is centred, so every letter added or erased used to move
		// the whole line sideways: about 70 small layout shifts a run. It is
		// now typed over an invisible copy of the resting text, starting where
		// that text starts and growing to the right (css/style.css,
		// .hero-typed-box), so a letter never moves the ones before it. The
		// copy holds the same text in the same place, so putting it in moves
		// nothing either.
		var box = doc.createElement('span');
		var sizer = doc.createElement('span');
		box.className = 'hero-typed-box';
		sizer.className = 'hero-typed-sizer';
		sizer.textContent = out.textContent;
		out.parentNode.insertBefore(box, out);
		box.appendChild(sizer);
		box.appendChild(out);

		var START_DELAY = 1200;
		var HOLD = 450;
		var ERASE_STEP = 4;   // letters removed per step
		var ERASE_MS = 30;
		var BUDGET = 4200;    // the whole run after the start delay, holds included

		// The run as a list of [wait, text] steps. Only the part after a shared
		// prefix is retyped ("Lập trình viên C++" -> "Lập trình viên Qt/QML"),
		// and erasing goes a few letters at a time: every step is a text
		// change, and every text change is a frame of layout and paint.
		var steps = [];
		var current = roles[0];
		var typedLetters = 0;
		sequence.forEach(function (next, i) {
			var common = 0;
			while (common < current.length && common < next.length && current.charAt(common) === next.charAt(common)) { common++; }
			for (var k = current.length; k > common;) {
				k = Math.max(common, k - ERASE_STEP);
				steps.push(['erase', current.slice(0, k)]);
			}
			for (k = common + 1; k <= next.length; k++) {
				steps.push(['type', next.slice(0, k)]);
				typedLetters++;
			}
			if (i < sequence.length - 1) { steps.push(['hold', null]); }
			current = next;
		});

		// Typing speed is whatever fits the budget, in either language.
		var fixed = 0;
		steps.forEach(function (s) { fixed += s[0] === 'hold' ? HOLD : s[0] === 'erase' ? ERASE_MS : 0; });
		var typeMs = Math.max(25, Math.min(70, (BUDGET - fixed) / typedLetters));

		// Each change gets a time measured from the start, so a slow phone
		// that runs late skips letters instead of stretching the run.
		var schedule = [];
		var t = typeMs;
		steps.forEach(function (s) {
			if (s[1] !== null) { schedule.push([t, s[1]]); }
			t += s[0] === 'hold' ? HOLD : s[0] === 'erase' ? ERASE_MS : typeMs;
		});

		var clock = window.performance && window.performance.now ? window.performance : Date;
		var start = 0;
		var index = 0;
		var timer = null;

		function finish() {
			window.clearTimeout(timer);
			index = schedule.length;
			out.textContent = roles[0];
			out.classList.remove('is-typing');
		}

		// Timers rather than requestAnimationFrame: a frame loop made the
		// browser render every frame for the whole run, where this renders
		// only when a letter changes.
		function tick() {
			var elapsed = clock.now() - start;
			var text = null;
			while (index < schedule.length && schedule[index][0] <= elapsed) {
				text = schedule[index][1];
				index++;
			}
			if (text !== null) { out.textContent = text; }
			if (index >= schedule.length) { finish(); return; }
			timer = window.setTimeout(tick, Math.max(0, schedule[index][0] - elapsed));
		}

		function begin() {
			out.classList.add('is-typing');
			start = clock.now();
			timer = window.setTimeout(tick, schedule[0][0]);
		}

		// A page opened in a background tab starts typing when it is first
		// looked at; one hidden mid-run jumps to the end rather than
		// crawling on throttled timers.
		doc.addEventListener('visibilitychange', function () {
			if (doc.hidden && out.classList.contains('is-typing')) { finish(); }
		});

		// Printed in the first few seconds, the page showed half a word.
		window.addEventListener('beforeprint', function () {
			if (out.classList.contains('is-typing')) { finish(); }
		});

		window.setTimeout(function () {
			if (!doc.hidden) { begin(); return; }
			doc.addEventListener('visibilitychange', function onVisible() {
				if (doc.hidden) { return; }
				doc.removeEventListener('visibilitychange', onVisible);
				window.setTimeout(begin, 600);
			});
		}, START_DELAY);
	}

	// ------------------------------------------------------------------
	// Off-canvas menu (the hamburger, below 993px)
	//
	// One function owns the open state, the button's icon and aria-expanded,
	// and whether the sidebar can take focus. Bootstrap's collapse used to
	// write aria-expanded from a different element's state, and three other
	// code paths closed the menu without telling it, so the button said
	// "expanded" while the menu was shut.
	// ------------------------------------------------------------------
	function initMenu() {
		var toggle = doc.querySelector('.js-colorlib-nav-toggle');
		var aside = doc.getElementById('colorlib-aside');
		if (!aside) { return; }

		function isOpen() { return body.classList.contains('offcanvas'); }

		// The sidebar is out of sight when the off-canvas menu is shut, or
		// when it has been collapsed on a wide screen. Its 15 links used to
		// stay in the Tab order there, focusable 300px off the left edge.
		function syncInert() {
			var hidden = offcanvasLayout.matches ? !isOpen() : aside.classList.contains('collapsed');
			if (hidden) { aside.setAttribute('inert', ''); } else { aside.removeAttribute('inert'); }
		}

		// On the off-canvas layout the sidebar photo is not fetched until the
		// menu is about to open (css/style.css, "Sidebar photo"): most phone
		// visits never open it. A press or keyboard focus on the button starts
		// the download a moment before the menu slides in.
		function wakeAvatar() { aside.classList.add('avatar-ready'); }

		function setOpen(open, returnFocus) {
			// Read focus before inert is applied: making the sidebar inert
			// blurs whatever inside it had focus.
			var focusInside = aside.contains(doc.activeElement);
			if (open) { wakeAvatar(); }
			body.classList.toggle('offcanvas', open);
			if (toggle) {
				toggle.classList.toggle('active', open);
				toggle.setAttribute('aria-expanded', String(open));
			}
			syncInert();
			if (!open && returnFocus && focusInside && toggle) { toggle.focus(); }
		}

		menu = {
			isOpen: isOpen,
			close: function (returnFocus) { if (isOpen()) { setOpen(false, returnFocus); } },
			syncInert: syncInert
		};

		if (toggle) {
			toggle.addEventListener('click', function () { setOpen(!isOpen(), true); });
			toggle.addEventListener('pointerdown', wakeAvatar);
			toggle.addEventListener('focus', wakeAvatar);
		}

		doc.addEventListener('keydown', function (e) {
			if ((e.key === 'Escape' || e.key === 'Esc') && isOpen()) {
				var focusOnToggle = doc.activeElement === toggle;
				setOpen(false, true);
				if (!focusOnToggle && toggle && (doc.activeElement === body || !doc.activeElement)) { toggle.focus(); }
			}
		});

		// A tap anywhere outside the open menu closes it.
		doc.addEventListener('click', function (e) {
			if (!isOpen()) { return; }
			if (aside.contains(e.target) || (toggle && toggle.contains(e.target))) { return; }
			setOpen(false, true);
		});

		// Widening the window past the breakpoint with the menu open would
		// otherwise leave the page shifted 300px to the right.
		onMediaChange(offcanvasLayout, function () {
			if (!offcanvasLayout.matches && isOpen()) { setOpen(false, false); }
			syncInert();
		});

		syncInert();
	}

	// ------------------------------------------------------------------
	// Desktop sidebar collapse (the tab on the sidebar's edge, 993px and up)
	// ------------------------------------------------------------------
	function initSidebar() {
		var aside = doc.getElementById('colorlib-aside');
		var button = doc.getElementById('sidebar-toggle');
		var handle = doc.querySelector('.sidebar-drag-handle');
		if (!aside) { return; }

		function isCollapsed() { return aside.classList.contains('collapsed'); }

		// The click, both drags and the saved preference all come through
		// here, so the button's state and name can never disagree with the
		// sidebar. The main column widens through CSS (#colorlib-aside.collapsed
		// ~ #colorlib-main), not an inline width.
		function setCollapsed(collapsed, persist) {
			aside.classList.toggle('collapsed', collapsed);
			if (button) {
				var label = collapsed ? T.expandSidebar : T.collapseSidebar;
				button.classList.toggle('collapsed', collapsed);
				button.setAttribute('aria-expanded', String(!collapsed));
				button.setAttribute('aria-label', label);
				button.setAttribute('title', label);
			}
			menu.syncInert();
			if (persist) { store.set('sidebarCollapsed', String(collapsed)); }
		}

		if (button) {
			button.addEventListener('click', function () { setCollapsed(!isCollapsed(), true); });
		}

		if (store.get('sidebarCollapsed') === 'true') { setCollapsed(true, false); }

		if (!handle) { return; }

		// Dragging the sidebar's edge left: on a wide screen it collapses the
		// sidebar, on the off-canvas layout it closes the menu.
		var dragging = false;
		var startX = 0;

		function stopDrag() {
			dragging = false;
			body.style.cursor = '';
			body.style.userSelect = '';
		}

		handle.addEventListener('mousedown', function (e) {
			dragging = true;
			startX = e.clientX;
			body.style.cursor = 'ew-resize';
			body.style.userSelect = 'none';
		});

		doc.addEventListener('mousemove', function (e) {
			if (!dragging) { return; }
			var collapse = 300 + (e.clientX - startX) < 100;
			if (offcanvasLayout.matches) {
				if (collapse) { stopDrag(); menu.close(true); }
				return;
			}
			if (collapse !== isCollapsed()) { setCollapsed(collapse, false); }
		});

		doc.addEventListener('mouseup', function () {
			if (!dragging) { return; }
			stopDrag();
			if (!offcanvasLayout.matches) { store.set('sidebarCollapsed', String(isCollapsed())); }
		});

		var touchStartX = 0;
		handle.addEventListener('touchstart', function (e) {
			touchStartX = e.touches[0].clientX;
		}, { passive: true });

		handle.addEventListener('touchmove', function (e) {
			if (e.touches[0].clientX - touchStartX >= -50) { return; }
			if (offcanvasLayout.matches) { menu.close(true); }
			else if (!isCollapsed()) { setCollapsed(true, true); }
		}, { passive: true });
	}

	// ------------------------------------------------------------------
	// Section jumps: the sidebar links, the hero's Contact button and the
	// dialogs' "Get in touch" links all take this one path.
	//
	// The 55px landing offset is section[data-section]{scroll-margin-top} in
	// the CSS, so a cold deep link (/#contact) lands in the same place. The
	// scroll is instant under reduced motion, and keyboard focus moves to
	// the section's heading -- it used to stay on the link, so the next Tab
	// went back to the sidebar, or jumped the page back up.
	// ------------------------------------------------------------------
	function goToSection(name) {
		var target = doc.querySelector('[data-section="' + name + '"]');
		if (!target) { return false; }

		revealNow(target);

		// Vertical only. scrollIntoView also scrolls sideways when it can, and
		// a link picked from the open off-canvas menu finds the page still
		// slid 300px to the right; as that slide-back ends, the sideways
		// overflow disappears and the scroll stopped 163px short of the
		// section. The offset is read from the CSS so it stays in one place.
		var margin = parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
		var top = target.getBoundingClientRect().top + (window.pageYOffset || root.scrollTop || 0) - margin;
		window.scrollTo({ top: Math.max(0, Math.round(top)), behavior: scrollBehavior() });

		focusQuietly(target.querySelector('h1, h2'));

		// The address bar shows the section picked, ready to copy or share.
		if (window.history && window.history.replaceState) {
			window.history.replaceState(null, '', name === 'home'
				? window.location.pathname + window.location.search
				: '#' + name);
		}
		return true;
	}

	function initSectionLinks() {
		doc.addEventListener('click', function (e) {
			// A modified click (new tab, new window) is left to the browser;
			// every one of these links has a real href.
			if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) { return; }
			var link = e.target.closest ? e.target.closest('a[data-nav-section], a[data-modal-goto]') : null;
			if (!link) { return; }
			var name = link.getAttribute('data-nav-section') || link.getAttribute('data-modal-goto');
			if (!doc.querySelector('[data-section="' + name + '"]')) { return; }

			e.preventDefault();
			// Focus is about to move to the section, so neither the dialog nor
			// the menu should hand it back to the control that opened them.
			if (link.hasAttribute('data-modal-goto')) { dialogs.close(false); }
			menu.close(false);
			goToSection(name);
		});
	}

	// ------------------------------------------------------------------
	// Which section is being read: the sidebar highlight, the language
	// switch's #fragment, and the section_view event.
	//
	// A section is current while it crosses a band 20-40% down the
	// viewport, whatever its height. The old 50%-visible rule could never be
	// met by Experience or Projects, which are taller than two screens, so
	// they never sent section_view; and Waypoints never highlighted Contact,
	// whose top stops 191px down at the end of the page. section_view now
	// needs a second in the band, so a smooth scroll that passes through a
	// section on the way somewhere else does not count as reading it.
	// ------------------------------------------------------------------
	function initSectionTracking() {
		var sections = doc.querySelectorAll('section[data-section]');
		if (!sections.length || !('IntersectionObserver' in window)) { return; }

		var navItems = doc.querySelectorAll('#navbar li');
		var langLink = doc.querySelector('.lang-switch a');
		var inBand = [];
		var current = null;
		var viewed = {};
		var dwellTimer = null;

		function setCurrent(name) {
			if (name === current) { return; }
			current = name;

			each(navItems, function (li) {
				var a = li.querySelector('a[data-nav-section]');
				li.classList.toggle('active', !!a && a.getAttribute('data-nav-section') === name);
			});

			// Switching language mid-page lands on the same section
			// (/#projects -> /vi/#projects); both pages share the ids.
			if (langLink) { langLink.hash = name === 'home' ? '' : name; }

			window.clearTimeout(dwellTimer);
			if (!viewed[name]) {
				dwellTimer = window.setTimeout(function () {
					if (current !== name || viewed[name]) { return; }
					viewed[name] = true;
					track('section_view', { section_name: name });
				}, 1000);
			}
		}

		var list = Array.prototype.slice.call(sections);
		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				inBand[list.indexOf(entry.target)] = entry.isIntersecting;
			});
			// Where two sections share the band, the lower one has just
			// entered it and is the one being read.
			for (var i = list.length - 1; i >= 0; i--) {
				if (inBand[i]) { setCurrent(list[i].getAttribute('data-section')); return; }
			}
		}, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });

		list.forEach(function (s) { observer.observe(s); });
	}

	// ------------------------------------------------------------------
	// Scroll: reading progress, back-to-top, and closing the open menu.
	// The one scroll listener on the page; work happens once per frame.
	// ------------------------------------------------------------------
	function initScrollEffects() {
		var bar = doc.getElementById('read-progress');
		var toTop = doc.getElementById('to-top');
		var docHeight = 0;
		var queued = false;
		var scrolled = false;
		var toTopShown = null;

		function update() {
			queued = false;
			var y = window.pageYOffset || root.scrollTop || 0;
			var viewportHeight = window.innerHeight;
			var max = (docHeight || root.scrollHeight) - viewportHeight;
			var progress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;

			// A transform, not a width: no layout on each frame.
			if (bar) { bar.style.transform = 'scaleX(' + progress.toFixed(4) + ')'; }

			var show = y > viewportHeight * 0.6;
			if (toTop && show !== toTopShown) {
				toTopShown = show;
				toTop.classList.toggle('is-visible', show);
			}

			if (scrolled) {
				scrolled = false;
				menu.close(true);
			}
		}

		function queue() {
			if (queued) { return; }
			queued = true;
			window.requestAnimationFrame(update);
		}

		window.addEventListener('scroll', function () { scrolled = true; queue(); }, { passive: true });
		window.addEventListener('resize', queue, { passive: true });

		// The document height is taken from ResizeObserver, which reports
		// after layout, rather than read (and forced) on a scroll frame. Its
		// first report also draws the bar for a page restored mid-scroll.
		if ('ResizeObserver' in window) {
			new ResizeObserver(function () {
				docHeight = root.scrollHeight;
				queue();
			}).observe(body);
		} else {
			queue();
		}

		if (toTop) {
			toTop.addEventListener('click', function () {
				window.scrollTo({ top: 0, behavior: scrollBehavior() });
			});
		}
	}

	// ------------------------------------------------------------------
	// Ambient motion in the hero
	//
	// The mesh, orbs, particles, grid and the availability ring are the
	// page's only endless animations. They pause (css/style.css, "Ambient
	// motion") while the hero is off screen or the tab is hidden, and pick up
	// where they stopped. Under reduced motion they never run at all.
	// ------------------------------------------------------------------
	function initAmbientMotion() {
		var hero = doc.getElementById('colorlib-hero');
		if (!hero) { return; }
		var offscreen = false;

		function apply() {
			hero.classList.toggle('motion-paused', offscreen || doc.hidden);
		}

		if ('IntersectionObserver' in window) {
			new IntersectionObserver(function (entries) {
				offscreen = !entries[entries.length - 1].isIntersecting;
				apply();
			}).observe(hero);
		}
		doc.addEventListener('visibilitychange', apply);
		apply();
	}

	// ------------------------------------------------------------------
	// Lazy CSS backgrounds
	//
	// The browser lazy-loads an <img>, not a CSS background, so a decorative
	// background far down the page ([data-lazy-bg]) gets its image from a
	// .bg-ready rule, added when it comes within about a screen of the
	// viewport. Early enough that the photo is there before the box fades
	// in, and never for a visitor who does not scroll that far.
	// ------------------------------------------------------------------
	function initLazyBackgrounds() {
		var boxes = doc.querySelectorAll('[data-lazy-bg]');
		if (!boxes.length) { return; }

		function ready(el) { el.classList.add('bg-ready'); }

		if (!('IntersectionObserver' in window)) {
			each(boxes, ready);
			return;
		}
		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) { return; }
				observer.unobserve(entry.target);
				ready(entry.target);
			});
		}, { rootMargin: '1000px 0px', threshold: 0 });
		each(boxes, function (el) { observer.observe(el); });
	}

	// ------------------------------------------------------------------
	// Education: three disclosure buttons, each showing its own panel.
	// ------------------------------------------------------------------
	function initDisclosures() {
		each(doc.querySelectorAll('.panel-toggle[aria-controls]'), function (button) {
			var panel = doc.getElementById(button.getAttribute('aria-controls'));
			if (!panel) { return; }
			button.addEventListener('click', function () {
				var open = button.getAttribute('aria-expanded') !== 'true';
				button.setAttribute('aria-expanded', String(open));
				panel.classList.toggle('in', open);
			});
		});
	}

	// ------------------------------------------------------------------
	// Collapse long contribution lists. The bullets ship visible, so this
	// only hides them once the toggle exists -- without JS nothing is lost.
	// ------------------------------------------------------------------
	function initContributionToggles() {
		// Two bullets a role on phones, where Experience alone ran to about
		// seven screens and Projects began ten screens down; four elsewhere.
		var KEEP_VISIBLE = media('(max-width: 768px)').matches ? 2 : 4;
		each(doc.querySelectorAll('.timeline-label > ul'), function (list, idx) {
			var items = Array.prototype.slice.call(list.children);
			if (items.length <= KEEP_VISIBLE + 2) { return; }

			var hidden = items.slice(KEEP_VISIBLE);
			var listId = 'contrib-list-' + idx;
			list.id = listId;

			// Two SMARTCAST roles share a job title, so a screen reader's list
			// of buttons showed identical toggles. Name the project as well.
			var projectEl = list.parentNode.querySelector('.timeline-project strong');
			var projectName = projectEl ? projectEl.textContent.replace(/^[^:]*:\s*/, '') : '';

			var button = doc.createElement('button');
			button.type = 'button';
			button.className = 'bullets-toggle';
			button.setAttribute('aria-controls', listId);

			function render(expanded) {
				hidden.forEach(function (li) { li.classList.toggle('is-collapsed', !expanded); });
				button.setAttribute('aria-expanded', String(expanded));
				button.textContent = expanded ? T.showFewer : T.showMore.replace('{n}', hidden.length);
				if (projectName) {
					var context = doc.createElement('span');
					context.className = 'sr-only';
					context.textContent = ' (' + projectName + ')';
					button.appendChild(context);
				}
			}

			button.addEventListener('click', function () {
				render(button.getAttribute('aria-expanded') !== 'true');
			});

			list.parentNode.insertBefore(button, list.nextSibling);
			render(false);
		});
	}

	// ------------------------------------------------------------------
	// Google Analytics: consent defaults first, then the tag, once the page
	// is up
	//
	// Consent Mode v2. The three advertising signals are denied for good,
	// and analytics cookies stay denied until the visitor allows them in the
	// consent notice. Until then GA4 sends cookieless pings, which count the
	// visit without recognising the browser next time. A visitor who
	// declines gets no Google Analytics at all, and its cookies are removed.
	//
	// gtag.js (about 175 KB) used to load from <head>, alongside the CSS a
	// phone needs for its first paint. It now waits for the first tap, key or
	// scroll, or for four seconds after the page has loaded, whichever comes
	// first. Its start-up is three long tasks on a mid-range phone; loaded as
	// soon as the page went idle, about a second after load, they landed in
	// the first seconds a visitor starts to read and tap. Events sent before
	// then wait in dataLayer and go out with it.
	//
	// This starts before every other feature, so no event can reach
	// dataLayer ahead of the consent defaults.
	// ------------------------------------------------------------------
	var GA_ID = 'G-0586HR4EGC';
	var CONSENT_KEY = 'analyticsConsent';

	function initGtag() {
		var choice = store.get(CONSENT_KEY);
		if (choice !== 'granted' && choice !== 'denied') { choice = null; }
		var requested = false;
		var TRIGGERS = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
		var AFTER_LOAD_MS = 4000;

		window.dataLayer = window.dataLayer || [];
		// gtag.js reads each call's arguments object, so the stub pushes
		// arguments itself rather than a copy.
		window.gtag = function () { window.dataLayer.push(arguments); };
		window['ga-disable-' + GA_ID] = choice === 'denied';

		window.gtag('consent', 'default', {
			ad_storage: 'denied',
			ad_user_data: 'denied',
			ad_personalization: 'denied',
			analytics_storage: choice === 'granted' ? 'granted' : 'denied',
			// An Allow clicked before gtag.js arrives is queued behind the
			// page_view; this lets that page_view go out with it.
			wait_for_update: 500
		});
		window.gtag('js', new Date());
		window.gtag('config', GA_ID, {
			allow_google_signals: false,
			allow_ad_personalization_signals: false,
			// 13 months in every browser, as the privacy note says. GA's own
			// default is two years, which Chrome cuts to 400 days anyway.
			cookie_expires: 395 * 24 * 60 * 60
		});

		function load() {
			each(TRIGGERS, function (type) { window.removeEventListener(type, load, true); });
			if (requested || choice === 'denied') { return; }
			requested = true;
			var script = doc.createElement('script');
			script.async = true;
			script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
			doc.head.appendChild(script);
		}

		// A visitor who never taps, types or scrolls is still counted.
		function afterLoad() { window.setTimeout(load, AFTER_LOAD_MS); }

		// GA's 'auto' cookie domain stops at this host (github.io is a public
		// suffix), so the cookies go with or without a domain attribute.
		function removeCookies() {
			var host = window.location.hostname;
			try {
				each((doc.cookie || '').split(';'), function (pair) {
					var name = pair.split('=')[0].trim();
					if (!/^_ga(_|$)/.test(name)) { return; }
					var expired = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
					doc.cookie = expired;
					if (host) { doc.cookie = expired + '; domain=' + host; }
				});
			} catch (e) { /* cookies blocked: there are none to remove */ }
		}

		analytics = {
			choice: function () { return choice; },
			choose: function (next) {
				choice = next === 'granted' ? 'granted' : 'denied';
				store.set(CONSENT_KEY, choice);
				window['ga-disable-' + GA_ID] = choice === 'denied';
				window.gtag('consent', 'update', { analytics_storage: choice });
				if (choice === 'granted') { load(); } else { removeCookies(); }
			}
		};

		if (choice === 'denied') {
			removeCookies();
			return;
		}
		each(TRIGGERS, function (type) {
			window.addEventListener(type, load, { capture: true, passive: true });
		});
		if (doc.readyState === 'complete') { afterLoad(); }
		else { window.addEventListener('load', afterLoad); }
	}

	// ------------------------------------------------------------------
	// Analytics events
	//
	// GA4's enhanced measurement already sends page_view, scroll,
	// file_download (the CV included) and outbound clicks, so the page no
	// longer sends its own copies of those: each was being counted twice.
	// The YouTube iframe API is no longer loaded either (the embeds dropped
	// enablejsapi=1, which is what made gtag load it at page start). What
	// is left is what GA cannot see on its own.
	// ------------------------------------------------------------------
	function initAnalytics() {
		// Which of the three CV links was used. A distinct name, because GA's
		// own file_download for the same click is the one that counts it.
		each(doc.querySelectorAll('a[href$="CV_PhamPhuocDung.pdf"]'), function (link) {
			var where = link.closest('#colorlib-aside') ? 'sidebar'
				: link.closest('[data-section="contact"]') ? 'contact'
				: link.closest('[data-section="home"]') ? 'hero' : 'other';
			link.addEventListener('click', function () {
				track('cv_download', { link_location: where });
			});
		});

		// Email and phone taps. A tap is intent, not a delivered message, so it
		// is its own event rather than generate_lead. Delegated, so the address
		// in the form's error message counts too.
		doc.addEventListener('click', function (e) {
			var a = e.target.closest ? e.target.closest('a[href^="mailto:"], a[href^="tel:"]') : null;
			if (!a) { return; }
			track('contact_click', { method: a.protocol === 'tel:' ? 'phone' : 'email' });
		});

		// A click into one of the project videos. The player is a cross-origin
		// frame, so the page only learns of it as focus leaving the window for
		// that frame. Once per video per visit.
		var videosSeen = {};
		window.addEventListener('blur', function () {
			window.setTimeout(function () {
				var frame = doc.activeElement;
				if (!frame || frame.tagName !== 'IFRAME' || !frame.closest('.project-video')) { return; }
				var id = frame.id || frame.src;
				if (videosSeen[id]) { return; }
				videosSeen[id] = true;
				track('select_content', { content_type: 'video', content_id: id });
			}, 0);
		});
	}

	// ------------------------------------------------------------------
	// Project detail dialogs
	// ------------------------------------------------------------------
	function initDialogs() {
		var openModal = null;
		var lastTrigger = null;
		var FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

		function focusable(modal) {
			// offsetParent is null for position:fixed elements, so it cannot be
			// used as the visibility test here -- check the box instead.
			return Array.prototype.filter.call(modal.querySelectorAll(FOCUSABLE), function (el) {
				var r = el.getBoundingClientRect();
				return r.width > 0 && r.height > 0;
			});
		}

		function open(modal, trigger) {
			if (!modal) { return; }
			if (openModal) { close(false); }

			lastTrigger = trigger || null;
			openModal = modal;

			// Replace the scrollbar with padding so the page behind does not
			// shift sideways when overflow is hidden.
			var gap = window.innerWidth - root.clientWidth;
			if (gap > 0) { body.style.paddingRight = gap + 'px'; }
			body.classList.add('modal-open');

			modal.hidden = false;
			// Focus the dialog itself rather than its first control, so the
			// title is announced and nothing starts out visually highlighted.
			modal.focus();
		}

		function close(returnFocus) {
			if (!openModal) { return; }
			var closing = openModal;
			closing.hidden = true;
			openModal = null;
			body.classList.remove('modal-open');
			body.style.paddingRight = '';
			// A dialog opened from its own link (/#privacy) gives the address
			// back without the fragment.
			if (closing.id && window.location.hash === '#' + closing.id && window.history && window.history.replaceState) {
				window.history.replaceState(null, '', window.location.pathname + window.location.search);
			}
			// The control that opened the dialog may be gone by now (the
			// consent notice hides once a choice is made in the privacy note),
			// or there was none (/#privacy). Focus then goes to the section
			// being read rather than to <body>.
			if (returnFocus !== false) {
				if (lastTrigger && lastTrigger.getClientRects().length) { lastTrigger.focus(); }
				else { focusReadingPosition(); }
			}
			lastTrigger = null;
		}

		dialogs = { open: open, close: close };

		each(doc.querySelectorAll('[data-project-modal]'), function (button) {
			button.addEventListener('click', function () {
				var key = button.getAttribute('data-project-modal');
				var modal = doc.getElementById('modal-' + key);
				if (!modal) { return; }
				open(modal, button);
				track('select_content', { content_type: 'project', item_id: key });
			});
		});

		each(doc.querySelectorAll('[data-modal-close]'), function (el) {
			el.addEventListener('click', function (e) { e.preventDefault(); close(); });
		});

		doc.addEventListener('keydown', function (e) {
			if (!openModal) { return; }

			if (e.key === 'Escape' || e.key === 'Esc') {
				e.preventDefault();
				close();
				return;
			}

			// Keep Tab inside the dialog.
			if (e.key !== 'Tab') { return; }
			var items = focusable(openModal);
			if (!items.length) { return; }
			var first = items[0];
			var last = items[items.length - 1];

			if (e.shiftKey && doc.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && doc.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		});
	}

	// ------------------------------------------------------------------
	// Consent notice and privacy note
	//
	// The notice (#consent) waits in the bottom corner until the visitor
	// picks Allow or Decline; it never blocks the page, and it is not shown
	// again once a choice is stored. The privacy note (#privacy) is a dialog
	// like the project ones, opened from the notice and from the foot of
	// Contact, or straight away by /#privacy. Its own Allow and Decline
	// buttons change the choice later.
	// ------------------------------------------------------------------
	function initConsent() {
		var notice = doc.getElementById('consent');
		var note = doc.getElementById('privacy');
		var spaceObserver = null;

		function render() {
			var choice = analytics.choice();
			var text = choice === 'granted' ? T.consentGranted
				: choice === 'denied' ? T.consentDenied : T.consentUnset;
			each(doc.querySelectorAll('[data-consent][aria-pressed]'), function (button) {
				button.setAttribute('aria-pressed', String(button.getAttribute('data-consent') === choice));
			});
			each(doc.querySelectorAll('[data-consent-state]'), function (line) {
				if (line.textContent !== text) { line.textContent = text; }
			});
		}

		// While the notice is up, the back-to-top button sits above it and
		// Contact ends with room to scroll clear of it: --consent-space in
		// css/style.css, kept to the notice's height by a ResizeObserver,
		// which reports after layout instead of forcing it. The value is set
		// on those two elements alone. Set on the root, where every element
		// inherits it, it made the browser restyle the whole page (about 800
		// elements, 45 ms on a throttled phone) just after start-up.
		var spaceUsers = [doc.getElementById('to-top'), doc.querySelector('.colorlib-contact')];

		function setSpace(value) {
			each(spaceUsers, function (el) {
				if (!el) { return; }
				if (value) { el.style.setProperty('--consent-space', value); }
				else { el.style.removeProperty('--consent-space'); }
			});
		}

		function showNotice() {
			notice.hidden = false;
			if (!('ResizeObserver' in window)) { return; }
			spaceObserver = new ResizeObserver(function (entries) {
				var size = entries[0].borderBoxSize;
				var height = size ? (size[0] || size).blockSize : notice.offsetHeight;
				setSpace(Math.ceil(height + 12) + 'px');
			});
			spaceObserver.observe(notice);
		}

		function hideNotice() {
			if (!notice || notice.hidden) { return; }
			notice.hidden = true;
			if (spaceObserver) { spaceObserver.disconnect(); spaceObserver = null; }
			setSpace(null);
		}

		each(doc.querySelectorAll('[data-consent]'), function (button) {
			button.addEventListener('click', function () {
				// Read before the notice hides: hiding it takes focus away
				// from the button that was pressed.
				var focusInNotice = !!notice && notice.contains(doc.activeElement);
				analytics.choose(button.getAttribute('data-consent'));
				render();
				hideNotice();
				if (focusInNotice) { focusReadingPosition(); }
			});
		});

		render();
		if (notice && !analytics.choice()) { showNotice(); }

		if (!note) { return; }

		// The "Privacy note" links. A modified click is left to the browser:
		// the new tab opens on /#privacy, which opens the note below.
		doc.addEventListener('click', function (e) {
			if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) { return; }
			var link = e.target.closest ? e.target.closest('a[href="#privacy"]') : null;
			if (!link) { return; }
			e.preventDefault();
			menu.close(false);
			dialogs.open(note, link);
		});

		function fromAddress() {
			if (window.location.hash === '#privacy') { dialogs.open(note, null); }
		}
		window.addEventListener('hashchange', fromAddress);
		fromAddress();
	}

	// ------------------------------------------------------------------
	// Contact form -> Formspree. Without fetch (or without this file) the
	// form still posts to Formspree as an ordinary form.
	// ------------------------------------------------------------------
	function initContactForm() {
		var form = doc.getElementById('contact-form');
		if (!form || !window.fetch || !window.FormData) { return; }

		form.addEventListener('submit', function (e) {
			e.preventDefault();

			var submitBtn = doc.getElementById('submit-btn');
			var btnText = submitBtn.querySelector('.btn-text');
			var btnLoading = submitBtn.querySelector('.btn-loading');
			var status = doc.getElementById('form-status');

			function busy(on) {
				btnText.style.display = on ? 'none' : 'inline';
				btnLoading.style.display = on ? 'inline' : 'none';
				submitBtn.disabled = on;
			}

			busy(true);
			status.className = 'form-status';
			status.textContent = '';

			window.fetch(form.action, {
				method: 'POST',
				body: new FormData(form),
				headers: { 'Accept': 'application/json' }
			}).then(function (response) {
				if (!response.ok) { throw new Error('Formspree responded with ' + response.status); }
				status.className = 'form-status success';
				status.textContent = T.formSent;
				track('generate_lead', { form_id: 'contact-form', method: 'formspree' });
				form.reset();
			}).catch(function (error) {
				status.className = 'form-status error';
				status.textContent = T.formFailed;
				var mail = doc.createElement('a');
				mail.href = 'mailto:' + CONTACT_EMAIL;
				mail.textContent = CONTACT_EMAIL;
				status.appendChild(mail);
				status.appendChild(doc.createTextNode('.'));
				track('form_submit_error', {
					form_id: 'contact-form',
					error_message: String((error && error.message) || error).slice(0, 100)
				});
				if (window.console) { window.console.error('Form submission error:', error); }
			}).then(function () {
				busy(false);
			});
		});
	}

	// ------------------------------------------------------------------
	function run(name, fn) {
		try { fn(); } catch (e) {
			if (window.console) { window.console.error('[site.js] ' + name + ' failed:', e); }
		}
	}

	function init() {
		body = doc.body;
		run('analytics loader', initGtag);
		run('menu', initMenu);
		run('sidebar', initSidebar);
		run('reveal', initReveal);
		run('typing', initTyping);
		run('ambient motion', initAmbientMotion);
		run('lazy backgrounds', initLazyBackgrounds);
		run('dialogs', initDialogs);
		run('consent', initConsent);
		run('section links', initSectionLinks);
		run('section tracking', initSectionTracking);
		run('scroll effects', initScrollEffects);
		run('disclosures', initDisclosures);
		run('contribution toggles', initContributionToggles);
		run('analytics', initAnalytics);
		run('contact form', initContactForm);
	}

	if (doc.readyState === 'loading') {
		doc.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
}());
