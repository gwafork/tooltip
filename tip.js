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
		init: function() {
			this.o = $.extend({}, this.d);
			this.v = $.extend({}, this.dv);
			this.initEvents();
		},

		initEvents: function() {
			var self = this;
			$(document).on('mouseenter.tip', this.o.selector, function(e) {
				var el = $(this);
				$('#tip').remove();
				clearTimeout(self.v.timer);
				clearTimeout(self.v.enter);
				if (self.v.active) {
					self.show(e, el);
				} else {
					timer = setTimeout(function() {
						self.v.active = true;
						self.show(e, el);
					}, self.o.showTime);
				}
			});

			$(document).on('mouseleave.tip', self.o.selector+', #tip', function(e) {
				$(document).off('mousemove.tip');
				$('#tip').remove();
				clearTimeout(self.v.timer);
				self.v.enter = setTimeout(function() {
					self.v.active = false;
				}, self.o.hideTime);
			});
		},

		show: function(e, el) {
			var self = this,
			    o    = this.o,
			    v    = this.v,
			    tip  = $.trim(el.attr('data-tip')),
			    follow   = el.attr('data-tip-follow') || o.follow,
			    aside    = el.attr('data-tip-aside') || o.aside,
			    position = el.attr('data-tip-position') || o.position;

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

				var p = {
					left: b.left + (b.width/2) - 9,
					top:  b.top-h
				};

				if (aside || position == 'left' || position == 'right') {
					p.top = b.top + (b.height/2) - (tb.height/2) + 2;
					p.left = b.left - tb.width - 5;
					if (p.left > maxX) {
						p.left = b.right + 5;
					} else if (p.left < 0) {
						arrow.css({top: (b.height/2)+7});
						p.left = b.right + 5;
						position = 'right';
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
							p.top = e.pageY-tb.height-winST-4;
						}
					} else {
						if (v.follow.x) {
							p.left = e.pageX-winSL+9;
						}
						if (v.follow.y) {
							p.top = e.pageY-(tb.height/2)-winST;
						}
					}

					$(document).on('mousemove.tip', function(e) {
						if (position == 'top' || position == 'bottom') {
							if (v.follow.x) {
								p.left = e.pageX-winSL-9;
							}
							if (v.follow.y) {
								p.top = e.pageY-tb.height-winST-4;
							}
						} else {
							if (v.follow.x) {
								p.left = e.pageX-winSL+9;
							}
							if (v.follow.y) {
								p.top = e.pageY-(tb.height/2)-winST;
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
