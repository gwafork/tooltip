// Tiny simplistic tooltip plugin for jQuery
// version 0.0.3
// Kane Cohen [KaneCohen@gmail.com] | https://github.com/KaneCohen
(function($) {
	$.fn.tip = function(options) {
		var o = $.extend(true, {}, options);
		o.selector = this.selector || '.tip';
		new Tip(o);
		return this;
	};

	function Tip(o) {
		this.init(o);
	}

	Tip.prototype = {
		o: {},
		d: {
			showTime: 200,
			hideTime: 1000,
			follow:   false,  // Follow mouse. Values: 'x', 'y', 'xy', false.
			position: 'auto', // top, bottom, left, right, auto.
			aside:    false,  // Place tooltip to the left/right based on "position" option. true, false.
			selector: '.tip',
			tpl: '<div id="tip" style="visibility: hidden;">' +
				'<div class="tipContent"></div>' +
				'<i class="tipArrow"></i>' +
			'</div>'
		},
		v: {},
		dv: {
			timer: null,
			enter: null,
			active: false,
			follow: {
				x: false,
				y: false
			}
		},
		init: function(o) {
			this.o = $.extend({}, this.d, o);
			this.v = $.extend({}, this.dv);
			this.initEvents();
		},

		initEvents: function() {
			var self = this;
			$(document).on('mouseover.tip', this.o.selector, function(e) {
				var el = $(this);
				if (! el.data('tip') && el.attr('title')) {
					el.attr('data-tip', $.trim(el.attr('title')));
				}
				el.removeAttr('title');
				$('#tip').remove();
				clearTimeout(self.v.timer);
				clearTimeout(self.v.enter);
				if (self.v.active) {
					self.show(e, el);
				} else {
					self.v.timer = setTimeout(function() {
						self.v.active = true;
						self.show(e, el);
					}, self.o.showTime);
				}
			});

			$(document).on('mouseout.tip', self.o.selector+', #tip', function(e) {
				$(document).off('mousemove.tip');
				$('#tip').remove();
				clearTimeout(self.v.timer);
				clearTimeout(self.v.enter);
				self.v.enter = setTimeout(function() {
					self.v.active = false;
				}, self.o.hideTime);
			});
		},

		show: function(e, el) {
			var self = this,
			    o    = this.o,
			    v    = this.v,
			    tip  = $.trim(el.data('tip')),
			    follow   = el.data('tipFollow') || o.follow,
			    aside    = el.data('tipAside') || o.aside,
			    position = el.data('tipPosition') || o.position;

			if (follow) {
				v.follow.x = follow.indexOf('x') >= 0;
				v.follow.y = follow.indexOf('y') >= 0;
			}

			if (tip !== null && tip.length !== 0) {
				var template = $(self.o.tpl),
				    arrow = template.find('.tipArrow'),
				    winSL = $(window).scrollLeft(),
				    winST = $(window).scrollTop(),
				    winW  = $(window).width(),
				    winH  = $(window).height(),
				    b     = el[0].getBoundingClientRect();

				template.find('.tipContent').text(tip);
				$('body').append(template);

				var tb = template[0].getBoundingClientRect(),
				    w  = tb.width,
				    h  = tb.height,
				    maxX = winW - w,
				    maxY = winH - h;
				template.css({
					width: w,
					height: h
				});

				var p = {
					left: b.left + (b.width/2) - 9,
					top:  b.top-h
				};

				if (aside || position == 'left' || position == 'right') {
					position = position != 'left' || position != 'right' ? 'right' : position;
					p.top = b.top + (b.height/2) - (h/2) + 2;
					p.left = b.left - w - 5;
					if (p.left > maxX) {
						p.left = b.right + 5;
						position = 'left';
					} else if (p.left < 0 || position == 'right') {
						p.left = b.right + 5;
					}
				} else {
					if (p.left > maxX) {
						arrow.css({left: p.left-maxX+5});
						p.left = maxX;
					} else if (p.left < 0) {
						p.left = 0;
					}
					if (p.top > maxY) {
						p.top = maxY;
					} else if (p.top < 0 || position == 'bottom') {
						p.top = b.bottom + 4;
						position = 'bottom';
					}
				}

				position = position == 'auto' ? 'top' : position;
				template.addClass(position);

				if (follow) {
					if (position == 'top' || position == 'bottom') {
						if (v.follow.x) {
							p.left = e.pageX-winSL-9;
						}
						if (v.follow.y) {
							p.top = e.pageY-h-winST-4;
							p.top += p.top < 0 ? h*2 : 0;
						}
					} else {
						if (v.follow.x) {
							p.left = e.pageX-winSL+9;
						}
						if (v.follow.y) {
							p.top = e.pageY-(h/2)-winST+2;
						}
					}

					$(document).on('mousemove.tip', function(e) {
						if (position == 'top' || position == 'bottom') {
							if (v.follow.x) {
								p.left = e.pageX-winSL-9;
							}
							if (v.follow.y) {
								p.top = e.pageY-h-winST-4;
								p.top += p.top < 0 ? h*2 : 0;
							}
						} else {
							if (v.follow.x) {
								p.left = e.pageX-winSL+9;
							}
							if (v.follow.y) {
								p.top = e.pageY-(h/2)-winST+2;
							}
						}

						template[0].style.left = p.left+'px';
						template[0].style.top = p.top+'px';
					});
				}

				template.css({left: p.left, top: p.top, visibility: 'visible'});
			}
		}
	};

})(jQuery);
