var KeyFinder = (function () {
    function KeyFinder(context, key) {
        var _this = this;
        this.context = context;
        this.key = key;
        this.cache = [];
        this.lastFilled = 0;
        this.key2index = new Map();
        this.context.exceptions.forEach(function (e) {
            _this.cache[e.index] = e.y;
            _this.key2index.set(key(e.index), e.index);
        });
    }
    KeyFinder.prototype.findValidStart = function (before) {
        for (var i = before - 1; i >= 0; --i) {
            if (this.cache[i] !== undefined) {
                return i;
            }
        }
        return -1;
    };
    KeyFinder.prototype.posByKey = function (key) {
        if (this.key2index.has(key)) {
            var index = this.key2index.get(key);
            return { index: index, pos: this.pos(index) };
        }
        return this.fillCacheTillKey(key);
    };
    KeyFinder.prototype.pos = function (index) {
        if (this.context.exceptions.length === 0) {
            return index * this.context.defaultRowHeight;
        }
        var cached = this.cache[index];
        if (cached !== undefined) {
            return cached;
        }
        var start = this.findValidStart(index);
        if (start < 0) {
            this.fillCache(0, index, 0);
        }
        else {
            this.fillCache(start + 1, index, this.cache[start] + this.heightOf(start));
        }
        return this.cache[index];
    };
    KeyFinder.prototype.fillCache = function (first, last, offset, callback) {
        if (last <= this.lastFilled) {
            if (!callback) {
                return;
            }
            for (var i = first; i <= last; ++i) {
                callback(i, this.key(i), this.cache[i]);
            }
            return;
        }
        var pos = offset;
        for (var i = first; i <= last; ++i) {
            this.cache[i] = pos;
            var key = this.key(i);
            this.key2index.set(key, i);
            if (callback) {
                callback(i, key, pos);
            }
            pos += this.heightOf(i);
        }
    };
    KeyFinder.prototype.heightOf = function (index) {
        var lookup = this.context.exceptionsLookup;
        return lookup.has(index) ? lookup.get(index) : this.context.defaultRowHeight;
    };
    KeyFinder.prototype.exceptionHeightOf = function (index, returnDefault) {
        if (returnDefault === void 0) { returnDefault = false; }
        var padding = this.context.padding(index);
        var lookup = this.context.exceptionsLookup;
        if (lookup.has(index)) {
            return lookup.get(index) - padding;
        }
        return returnDefault ? this.context.defaultRowHeight - padding : null;
    };
    KeyFinder.prototype.padding = function (index) {
        return this.context.padding(index);
    };
    KeyFinder.prototype.fillCacheTillKey = function (target) {
        var pos = 0;
        for (var i = this.lastFilled; i < this.context.numberOfRows; ++i, ++this.lastFilled) {
            var c = this.cache[i];
            if (c !== undefined) {
                pos = c + this.heightOf(i);
                continue;
            }
            var key = this.key(i);
            this.cache[i] = pos;
            this.key2index.set(key, i);
            if (key === target) {
                return { index: i, pos: pos };
            }
            pos += this.heightOf(i);
        }
        return { index: -1, pos: -1 };
    };
    KeyFinder.prototype.positions = function (first, last, offset, callback) {
        this.fillCache(first, last, offset, callback);
    };
    return KeyFinder;
}());
export default KeyFinder;
//# sourceMappingURL=KeyFinder.js.map