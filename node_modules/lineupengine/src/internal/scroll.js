export var defaultMode = 'animation';
var ScrollHandler = (function () {
    function ScrollHandler(node) {
        var _this = this;
        this.node = node;
        this.handlers = new Map();
        this.animationWaiting = false;
        this.immediateTimeout = -1;
        this.timersWaiting = new Set();
        this.prevs = new Map();
        node.addEventListener('scroll', function () {
            _this.handle('sync');
            _this.handleAnimation();
            _this.handleImmediate();
            _this.handleTimeouts();
        }, {
            passive: true
        });
    }
    ScrollHandler.prototype.has = function (mode) {
        return this.handlers.has(mode) && this.handlers.get(mode).length > 0;
    };
    ScrollHandler.prototype.handle = function (mode) {
        var handlers = this.handlers.get(mode) || [];
        if (!handlers || handlers.length <= 0) {
            return;
        }
        var info = this.asInfo();
        if (this.prevs.has(mode)) {
            var prev = this.prevs.get(mode);
            if ((Math.abs(info.left - prev.left) + Math.abs(info.top - prev.top)) < 4) {
                return;
            }
        }
        this.prevs.set(mode, info);
        for (var _i = 0, handlers_1 = handlers; _i < handlers_1.length; _i++) {
            var s = handlers_1[_i];
            s(info);
        }
    };
    ScrollHandler.prototype.handleAnimation = function () {
        var _this = this;
        if (this.animationWaiting || !this.has('animation')) {
            return;
        }
        this.animationWaiting = true;
        requestAnimationFrame(function () {
            if (!_this.animationWaiting) {
                return;
            }
            _this.animationWaiting = false;
            _this.handle('animation');
        });
    };
    ScrollHandler.prototype.handleImmediate = function () {
        var _this = this;
        if (this.immediateTimeout >= 0 || !this.has('immediate')) {
            return;
        }
        this.immediateTimeout = self.setImmediate(function () {
            if (_this.immediateTimeout < 0) {
                return;
            }
            _this.immediateTimeout = -1;
            _this.handle('immediate');
        });
    };
    ScrollHandler.prototype.handleTimeouts = function () {
        var _this = this;
        var numbers = Array.from(this.handlers.keys()).filter(function (d) { return typeof d === 'number' && !_this.timersWaiting.has(d); });
        if (numbers.length === 0) {
            return;
        }
        var _loop_1 = function (n) {
            this_1.timersWaiting.add(n);
            self.setTimeout(function () {
                _this.timersWaiting.delete(n);
                _this.handle(n);
            }, n);
        };
        var this_1 = this;
        for (var _i = 0, numbers_1 = numbers; _i < numbers_1.length; _i++) {
            var n = numbers_1[_i];
            _loop_1(n);
        }
    };
    ScrollHandler.prototype.asInfo = function () {
        return {
            left: this.node.scrollLeft,
            top: this.node.scrollTop,
            width: this.node.clientWidth,
            height: this.node.clientHeight
        };
    };
    ScrollHandler.prototype.push = function (mode, handler) {
        if (mode === 'immediate' && typeof (self.setImmediate) !== 'function') {
            mode = 0;
        }
        if (this.handlers.has(mode)) {
            this.handlers.get(mode).push(handler);
        }
        else {
            this.handlers.set(mode, [handler]);
        }
    };
    ScrollHandler.prototype.remove = function (handler) {
        return Array.from(this.handlers.values()).some(function (d) {
            var index = d.indexOf(handler);
            if (index >= 0) {
                d.splice(index, 1);
            }
            return index >= 0;
        });
    };
    return ScrollHandler;
}());
export function addScroll(scroller, mode, handler) {
    if (!scroller.__le_scroller__) {
        scroller.__le_scroller__ = new ScrollHandler(scroller);
    }
    var s = scroller.__le_scroller__;
    s.push(mode, handler);
    return s.asInfo();
}
export function removeScroll(scroller, handler) {
    if (scroller.__le_scroller__) {
        scroller.__le_scroller__.remove(handler);
    }
}
//# sourceMappingURL=scroll.js.map