/* 2016-02-04 - v0.01 */
/* NTVIEW */
(function (root, name, factory) {
    // AMD
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    }
    // Node and CommonJS-like environments
    else if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = factory();
    }
    // Browser global
    else {
        root[name] = factory();
    }
}(this, 'withinviewport', function () {
    var canUseWindowDimensions = window.innerHeight !== undefined; // IE 8 and lower fail this

    /**
     * Determines whether an element is within the viewport
     * @param  {Object}  elem       DOM Element (required)
     * @param  {Object}  options    Optional settings
     * @return {Boolean}            Whether the element was completely within the viewport
    */
    var withinviewport = function withinviewport (elem, options) {
        var result = false;
        var metadata = {};
        var config = {};
        var settings;
        var isWithin;
        var elemBoundingRect;
        var sideNamesPattern;
        var sides;
        var side;
        var i;

        // If invoked by the jQuery plugin, get the actual DOM element
        if (typeof jQuery !== 'undefined' && elem instanceof jQuery) {
            elem = elem.get(0);
        }

        if (typeof elem !== 'object' || elem.nodeType !== 1) {
            throw new Error('First argument must be an element');
        }

        // Look for inline settings on the element
        if (elem.getAttribute('data-withinviewport-settings') && window.JSON) {
            metadata = JSON.parse(elem.getAttribute('data-withinviewport-settings'));
        }

        // Settings argument may be a simple string (`top`, `right`, etc)
        if (typeof options === 'string') {
            settings = {sides: options};
        }
        else {
            settings = options || {};
        }

        // Build configuration from defaults and user-provided settings and metadata
        config.container = settings.container || metadata.container || withinviewport.defaults.container || window;
        config.sides  = settings.sides  || metadata.sides  || withinviewport.defaults.sides  || 'all';
        config.top    = settings.top    || metadata.top    || withinviewport.defaults.top    || 0;
        config.right  = settings.right  || metadata.right  || withinviewport.defaults.right  || 0;
        config.bottom = settings.bottom || metadata.bottom || withinviewport.defaults.bottom || 0;
        config.left   = settings.left   || metadata.left   || withinviewport.defaults.left   || 0;

        // Use the window as the container if the user specified the body or a non-element
        if (config.container === document.body || !config.container.nodeType === 1) {
            config.container = window;
        }

        // Element testing methods
        isWithin = {
            // Element is below the top edge of the viewport
            top: function _isWithin_top () {
                return elemBoundingRect.top >= config.top;
            },

            // Element is to the left of the right edge of the viewport
            right: function _isWithin_right () {
                var containerWidth;

                if (canUseWindowDimensions || config.container !== window) {
                    containerWidth = config.container.innerWidth;
                }
                else {
                    containerWidth = document.documentElement.clientWidth;
                }

                // Note that `elemBoundingRect.right` is the distance from the *left* of the viewport to the element's far right edge
                return elemBoundingRect.right <= containerWidth - config.right;
            },

            // Element is above the bottom edge of the viewport
            bottom: function _isWithin_bottom () {
                var containerHeight;

                if (canUseWindowDimensions || config.container !== window) {
                    containerHeight = config.container.innerHeight;
                }
                else {
                    containerHeight = document.documentElement.clientHeight;
                }

                // Note that `elemBoundingRect.bottom` is the distance from the *top* of the viewport to the element's bottom edge
                return elemBoundingRect.bottom <= containerHeight - config.bottom;
            },

            // Element is to the right of the left edge of the viewport
            left: function _isWithin_left () {
                return elemBoundingRect.left >= config.left;
            },

            // Element is within all four boundaries
            all: function _isWithin_all () {
                // Test each boundary in order of most efficient and most likely to be false so that we can avoid running all four functions on most elements
                // Top: Quickest to calculate + most likely to be false
                // Bottom: Note quite as quick to calculate, but also very likely to be false
                // Left and right are both equally unlikely to be false since most sites only scroll vertically, but left is faster
                return (isWithin.top() && isWithin.bottom() && isWithin.left() && isWithin.right());
            }
        };

        // Get the element's bounding rectangle with respect to the viewport
        elemBoundingRect = elem.getBoundingClientRect();

        // Test the element against each side of the viewport that was requested
        sideNamesPattern = /^top$|^right$|^bottom$|^left$|^all$/;
        // Loop through all of the sides
        sides = config.sides.split(' ');
        i = sides.length;
        while (i--) {
            side = sides[i].toLowerCase();

            if (sideNamesPattern.test(side)) {
                if (isWithin[side]()) {
                    result = true;
                }
                else {
                    result = false;

                    // Quit as soon as the first failure is found
                    break;
                }
            }
        }

        return result;
    };

    // Default settings
    withinviewport.prototype.defaults = {
        container: document.body,
        sides: 'all',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    };

    withinviewport.defaults = withinviewport.prototype.defaults;

    /**
     * Optional enhancements and shortcuts
     *
     * @description Uncomment or comment these pieces as they apply to your project and coding preferences
     */

    // Shortcut methods for each side of the viewport
    // Example: `withinviewport.top(elem)` is the same as `withinviewport(elem, 'top')`
    withinviewport.prototype.top = function _withinviewport_top (element) {
        return withinviewport(element, 'top');
    };

    withinviewport.prototype.right = function _withinviewport_right (element) {
        return withinviewport(element, 'right');
    };

    withinviewport.prototype.bottom = function _withinviewport_bottom (element) {
        return withinviewport(element, 'bottom');
    };

    withinviewport.prototype.left = function _withinviewport_left (element) {
        return withinviewport(element, 'left');
    };

    return withinviewport;
}));

function debounce(func, wait, immediate) 
{
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};
function inView(targetId, callback) 
{	
	var targetElement = document.getElementById(targetId);
	if ('undefined' !== typeof targetElement && 'function' === typeof callback) {
			if ('undefined' === typeof window.inview) {
			window.inview = {};
		}

		inview[targetId] = false;

		var check = function() {
	    	if (!window.inview[targetId] && withinviewport(targetElement) == true) {
	    		window.inview[targetId] = true;
				callback();
				return true;
		    }

		    return false;
		};

		if ( !check() ) {
			var scrollViewFn = debounce(check, 20);
			window.addEventListener('scroll', scrollViewFn);
		}
	} else {
		return false;
	}
}
// Site specific settings
if(document.location.host == 'localhost'){
    withinviewport.defaults.bottom = -200;
}

// Function that makes the SAC call
function SAC(){
    console.log("sac.event('ntv_preview', {'SAP_id': '', 'SAP_pid': '', 'site': 'siteURL', 'currentPage': 'currentPage', 'timestamp': 'timestamp')");
}
/*****************************************************************
//      Article page measuring. Will only load on article pages.
//		events measured:
//		how many times the page loaded
//		how may times people started to scroll
//		how many reached the bottom of the content
//		how many reached the bottom of the page
//		time in seconds per event
*****************************************************************/
jQuery(function($) {
    if($('head').find('meta[property="og:type"]').attr('content') == 'article'){
        // Debug flag
        var debugMode = true;

        // Default time delay before checking location
        var callBackTime = 100;

        // # px before tracking a reader
        //var startArticle = $("div.content").offset().top; // Enter the element name where the article content starts

        // Set some flags for tracking & execution
        var timer = 0;
        var scroller = false;
        var midContent = false;
        var endContent = false;
        var didComplete = false;

        // Set some time variables to calculate reading time
        var startTime = new Date();
        var beginning = startTime.getTime();
        var totalTime = 0;
        
        // Get some information about the current page
        var pageTitle = document.title;

        // Get host of current site
        var pageHost = document.location.host;

        // Specify elements based on host
        if(pageHost == 'localhost'){
        	var elemType = '2';
            var elemArticle = 'main article[itemprop="blogPost"]';
        }else if(pageHost == 'nu.nl'){
            var elemType = '1';
            // Element name directly above article
            var elemArticleTop = 'div.block.article.header';
            // Element name directly below article
            var elemArticleBot = 'div.block.article.tags';
        }

        // Track the aticle load
        if (!debugMode) {
            sat.event('ntv_article', {'article': pageTitle, 'type': 'Reading', 'position': 'ArticleLoaded'});
        } else {
            console.log('Artikel pagina is geladen (pageview). Time on site is gestart.'); 
        }

        // Check the location and track user
        function trackLocation() {
            bottom = $(window).height() + $(window).scrollTop();
            height = $(document).height();
            startArticle = $('main article[itemprop="blogPost"]').offset().top;
            // METHOD 1 - when the article content isn't wrapped in one element
    		//midArticle = (($(ElemArticleBot).offset().top - $(elemArticleTop).offset().top) / 2) + $(elemArticleTop).offset().top;

    		// METHOD 2 - 
    		midArticle = ($(elemArticle).innerHeight() / 2) + $(elemArticle).offset().top;

    		// METHOD 1 - when only the article content isn't wrapped in one element
    		//endArticle = $("div.content").offset().top; // Enter the element name that is directly below the article content
            //endArticle = $(elemArticleBot).offset().top + $(elemArticleTop).offset().top;

    		// METHOD 2 - when article content is wrapped in one element
    		endArticle = $(elemArticle).innerHeight() + $(elemArticle).offset().top; // Get height of article content and add top offset		

            // If user starts to scroll send an event
            if (bottom > startArticle && !scroller) {
                currentTime = new Date();
                scrollStart = currentTime.getTime();
                timeToScroll = Math.round(scrollStart - beginning) / 1000;
                if (!debugMode) {
                    sat.event('ntv_article', {'article': pageTitle, 'type': 'Reading', 'position': 'ContentStart', 'time': timeToScroll});
                } else {
                    console.log('Start van het artikel. Aantal seconden op pagina tot begin artikel: '+timeToScroll);
                }
                scroller = true;
            }

            // If user has hit the middle of the content send an event
            if (bottom >= midArticle && !midContent) {
    			currentTime = new Date();
                contentScrollMid = currentTime.getTime();
                timeToContentMid = Math.round(contentScrollMid - scrollStart) / 1000;
                timeTotalContentMid = Math.round(contentScrollMid - beginning) / 1000;
                if (!debugMode) {
                     if (timeToContentMid < 15) {
                        type = 'Scanner'; 
                    } else {
                        type = 'Reader';
                    }
                    sat.event('ntv_article', {'article': pageTitle, 'type': type, 'position': 'ContentMiddle', 'time': timeToContentMid});
                } else {
                    console.log('Midden van het artikel. Aantal seconden van start artikel tot midden van het artikel: '+timeToContentMid+' Totaal aantal seconden op pagina: '+timeTotalContentMid);
                }
                midContent = true;
            }
            // If user has hit the bottom of the content send an event
            if (bottom >= endArticle && !endContent) {
                currentTime = new Date();
                contentScrollEnd = currentTime.getTime();
                timeToContentEnd = Math.round(contentScrollEnd - scrollStart) / 1000;
                timeTotalContentEnd = Math.round(contentScrollEnd - beginning) / 1000;
                if (!debugMode) {
                     if (timeToContentEnd < 30) {
                        type = 'Scanner'; 
                    } else {
                        type = 'Reader';
                    }
                    sat.event('ntv_article', {'article': pageTitle, 'type': type, 'position': 'ContentBottom', 'time': timeToContentEnd});
                } else {
                    console.log('Eind van het artikel. Totaal aantal seconden artikel gelezen: '+timeToContentEnd+' Totaal aantal seconden op pagina: '+timeTotalContentEnd);
                }
                endContent = true;
            }

            // If user has hit the bottom of page send an event
            if (bottom >= height && !didComplete) {
                currentTime = new Date();
                end = currentTime.getTime();
                totalTime = Math.round(end - beginning) / 1000;
                totalActiveTime = Math.round(end - scrollStart) / 1000;
                if (!debugMode) {
                    sat.event('ntv_article', {'article': pageTitle, 'type': 'Reading', 'position': 'PageBottom', 'time': totalTime});
                } else {
                    console.log('Eind van pagina bereikt. Totaal aantal seconden op pagina: '+totalTime+' Totaal aantal seconden ACTIEF op pagina: '+totalActiveTime);
                }
                didComplete = true;
            }
        }

        // Track the scrolling and track location
        $(window).scroll(function() {
            if (timer) {
                clearTimeout(timer);
            }

            // Use a buffer so we don't call trackLocation too often.
            timer = setTimeout(trackLocation, callBackTime);
        });
    }
});