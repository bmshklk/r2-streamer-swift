

// WARNING: iOS 9 requires ES5


// Notify native code that the page has loaded.
window.addEventListener("load", function(){ // on page load
    // Notify native code that the page is loaded.
    webkit.messageHandlers.didLoad.postMessage("");
    window.addEventListener("orientationchange", orientationChanged);
    orientationChanged();
}, false);

var last_known_scrollX_position = 0;
var last_known_scrollY_position = 0;
var ticking = false;
var maxScreenX = 0;

// Position in range [0 - 1].
var update = function(position) {
    var positionString = position.toString()
    webkit.messageHandlers.updateProgression.postMessage(positionString);
};

window.addEventListener('scroll', function(e) {
    last_known_scrollY_position = window.scrollY / document.body.scrollHeight;
    last_known_scrollX_position = window.scrollX / document.body.scrollWidth;
    if (!ticking) {
        window.requestAnimationFrame(function() {
            update(isScrollModeEnabled() ? last_known_scrollY_position : last_known_scrollX_position);
            ticking = false;
        });
    }
    ticking = true;
});

function orientationChanged() {
    maxScreenX = (window.orientation === 0 || window.orientation == 180) ? screen.width : screen.height;
    snapCurrentPosition();
}

function isScrollModeEnabled() {
    return document.documentElement.style.getPropertyValue("--USER__scroll").toString().trim() == 'readium-scroll-on';
}

// Scroll to the given TagId in document and snap.
var scrollToId = function(id) {
    var element = document.getElementById(id);
    var elementOffset = element.scrollLeft // element.getBoundingClientRect().left works for Gutenbergs books
    var offset = window.scrollX + elementOffset;

    document.body.scrollLeft = snapOffset(offset);
};

// Position must be in the range [0 - 1], 0-100%.
var scrollToPosition = function(position, dir) {
    console.log("ScrollToPosition");
    if ((position < 0) || (position > 1)) {
        console.log("InvalidPosition");
        return;
    }

    if (isScrollModeEnabled()) {
        var offset = document.body.scrollHeight * position;
        document.body.scrollTop = offset;
        // window.scrollTo(0, offset);
    } else {
        var offset = 0.0;
        if (dir == 'rtl') {
            offset = (-document.body.scrollWidth + maxScreenX) * (1.0-position);
        } else {
            offset = document.body.scrollWidth * position;
        }
        document.body.scrollLeft = snapOffset(offset);
    }
};

var scrollLeft = function(dir) {
    var scrollWidth = document.body.scrollWidth;
    var newOffset = window.scrollX - window.innerWidth;
    var edge = -scrollWidth + window.innerWidth;
    var newEdge = (dir == "rtl")? edge:0;
    
    if (window.innerWidth == scrollWidth) {
        // No scroll and default zoom
        return "edge";
    } else {
        // Scrolled and zoomed
        if (newOffset > newEdge) {
            document.body.scrollLeft = newOffset
            return 0;
        } else {
            var oldOffset = window.scrollX;
            document.body.scrollLeft = newEdge;
            var diff = Math.abs(newEdge-oldOffset)/window.innerWidth;
            // In some case the scrollX cannot reach the position respecting to innerWidth
            if (diff > 0.01) {
                return 0;
            } else {
                return "edge";
            }
        }
    }
};

var scrollRight = function(dir) {
    
    var scrollWidth = document.body.scrollWidth;
    var newOffset = window.scrollX + window.innerWidth;
    var edge = scrollWidth - window.innerWidth;
    var newEdge = (dir == "rtl")? 0:edge
    
    if (window.innerWidth == scrollWidth) {
        // No scroll and default zoom
        return "edge";
    } else {
        // Scrolled and zoomed
        if (newOffset < newEdge) {
            document.body.scrollLeft = newOffset
            return 0;
        } else {
            var oldOffset = window.scrollX;
            document.body.scrollLeft = newEdge;
            var diff = Math.abs(newEdge-oldOffset)/window.innerWidth;
            // In some case the scrollX cannot reach the position respecting to innerWidth
            if (diff > 0.01) {
                return 0;
            } else {
                return "edge";
            }
        }
    }
};

// Snap the offset to the screen width (page width).
var snapOffset = function(offset) {
    var value = offset + 1;

    return value - (value % maxScreenX);
};

var snapCurrentPosition = function() {
    var currentOffset = window.scrollX;
    var currentOffsetSnapped = snapOffset(currentOffset + 1);
    
    document.body.scrollLeft = currentOffsetSnapped;
};

/// User Settings.

// For setting user setting.
var setProperty = function(key, value) {
    var root = document.documentElement;

    root.style.setProperty(key, value);
};

// For removing user setting.
var removeProperty = function(key) {
    var root = document.documentElement;

    root.style.removeProperty(key);
};
