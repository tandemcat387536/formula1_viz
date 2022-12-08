import { ABORTED, isAbortAble } from './abortAble';
import { defaultPhases, EAnimationMode, noAnimationChange } from './animation';
import KeyFinder from './animation/KeyFinder';
import { range } from './logic';
import { EScrollResult } from './mixin';
import { addScroll, removeScroll, defaultMode } from './internal';
var ARowRenderer = (function () {
    function ARowRenderer(body, options) {
        if (options === void 0) { options = {}; }
        var _this = this;
        this.body = body;
        this.pool = [];
        this.loadingPool = [];
        this.loading = new Map();
        this.visible = {
            first: 0,
            forcedFirst: 0,
            last: -1,
            forcedLast: -1
        };
        this.visibleFirstRowPos = 0;
        this.scrollListener = null;
        this.abortAnimation = function () { return undefined; };
        this.options = {
            async: defaultMode,
            minScrollDelta: 10,
            mixins: [],
            scrollingHint: false,
            batchSize: 5
        };
        this.adapter = this.createAdapter();
        Object.assign(this.options, options);
        this.mixins = this.options.mixins.map(function (mixinClass) { return new mixinClass(_this.adapter); });
        this.fragment = body.ownerDocument.createDocumentFragment();
    }
    ARowRenderer.prototype.addMixin = function (mixinClass, options) {
        this.mixins.push(new mixinClass(this.adapter, options));
    };
    ARowRenderer.prototype.createAdapter = function () {
        var _this = this;
        var r = {
            visible: this.visible,
            addAtBeginning: this.addAtBeginning.bind(this),
            addAtBottom: this.addAtBottom.bind(this),
            removeFromBeginning: this.removeFromBeginning.bind(this),
            removeFromBottom: this.removeFromBottom.bind(this),
            updateOffset: this.updateOffset.bind(this),
            scroller: this.bodyScroller
        };
        Object.defineProperties(r, {
            visibleFirstRowPos: {
                get: function () { return _this.visibleFirstRowPos; },
                enumerable: true
            },
            context: {
                get: function () { return _this.context; },
                enumerable: true
            }
        });
        return r;
    };
    Object.defineProperty(ARowRenderer.prototype, "bodyScroller", {
        get: function () {
            return this.body.parentElement;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ARowRenderer.prototype, "bodySizer", {
        get: function () {
            var parent = this.bodyScroller;
            var sizer = Array.from(parent.children).find(function (d) { return d.tagName.toLowerCase() === 'footer'; });
            if (sizer) {
                return sizer;
            }
            var s = parent.ownerDocument.createElement('footer');
            parent.insertBefore(s, parent.firstChild);
            return s;
        },
        enumerable: true,
        configurable: true
    });
    ARowRenderer.prototype.init = function () {
        var _this = this;
        var scroller = this.bodyScroller;
        var old = addScroll(scroller, this.options.async, this.scrollListener = function (act) {
            if (Math.abs(old.top - act.top) < _this.options.minScrollDelta && Math.abs(old.height - act.height) < _this.options.minScrollDelta) {
                return;
            }
            var isGoingDown = act.top > old.top;
            old = act;
            _this.onScrolledVertically(act.top, act.height, isGoingDown);
            if (_this.options.scrollingHint) {
                scroller.classList.remove('le-scrolling');
            }
        });
        if (this.options.scrollingHint) {
            addScroll(scroller, 'animation', function () { return scroller.classList.add('le-scrolling'); });
        }
        this.recreate();
    };
    ARowRenderer.prototype.destroy = function () {
        removeScroll(this.bodyScroller, this.scrollListener);
        this.body.remove();
    };
    ARowRenderer.cleanUp = function (item) {
        if (item.style.height) {
            item.style.height = null;
        }
    };
    ARowRenderer.prototype.select = function (index) {
        var item;
        var result;
        if (this.pool.length > 0) {
            item = this.pool.pop();
            result = this.updateRow(item, index);
        }
        else if (this.loadingPool.length > 0) {
            item = this.loadingPool.pop();
            item.classList.remove('loading');
            result = this.createRow(item, index);
        }
        else {
            item = this.body.ownerDocument.createElement('div');
            result = this.createRow(item, index);
        }
        item.dataset.index = String(index);
        return { item: item, result: result };
    };
    ARowRenderer.prototype.selectProxy = function () {
        var proxy;
        if (this.loadingPool.length > 0) {
            proxy = this.loadingPool.pop();
        }
        else {
            proxy = this.body.ownerDocument.createElement('div');
            proxy.classList.add('loading');
        }
        return proxy;
    };
    ARowRenderer.prototype.recycle = function (item) {
        ARowRenderer.cleanUp(item);
        if (this.loading.has(item)) {
            var abort = this.loading.get(item);
            abort.abort();
        }
        else {
            this.pool.push(item);
        }
    };
    ARowRenderer.prototype.proxy = function (item, result) {
        var _this = this;
        if (!isAbortAble(result)) {
            return item;
        }
        var abort = result;
        var real = item;
        var proxy = this.selectProxy();
        proxy.dataset.index = real.dataset.index;
        proxy.style.height = real.style.height;
        this.loading.set(proxy, abort);
        abort.then(function (result) {
            if (result === ABORTED) {
                ARowRenderer.cleanUp(real);
                _this.pool.push(real);
            }
            else {
                _this.body.replaceChild(real, proxy);
            }
            _this.loading.delete(proxy);
            ARowRenderer.cleanUp(proxy);
            _this.loadingPool.push(proxy);
        });
        return proxy;
    };
    ARowRenderer.prototype.create = function (index) {
        var _a = this.select(index), item = _a.item, result = _a.result;
        var _b = this.context, ex = _b.exceptionsLookup, padding = _b.padding;
        if (ex.has(index)) {
            item.style.height = ex.get(index) - padding(index) + "px";
        }
        return this.proxy(item, result);
    };
    ARowRenderer.prototype.removeAll = function () {
        var _this = this;
        var arr = Array.from(this.body.children);
        this.body.innerHTML = '';
        arr.forEach(function (item) {
            _this.recycle(item);
        });
    };
    ARowRenderer.prototype.update = function () {
        var _this = this;
        var first = this.visible.first;
        var fragment = this.fragment;
        var items = Array.from(this.body.children);
        this.body.innerHTML = '';
        items.forEach(function (item, i) {
            if (_this.loading.has(item)) {
                return;
            }
            var abort = _this.updateRow(item, i + first);
            fragment.appendChild(_this.proxy(item, abort));
        });
        this.body.appendChild(fragment);
    };
    ARowRenderer.prototype.forEachRow = function (callback, inplace) {
        var _this = this;
        if (inplace === void 0) { inplace = false; }
        var rows = Array.from(this.body.children);
        var fragment = this.fragment;
        if (!inplace) {
            this.body.innerHTML = '';
        }
        rows.forEach(function (row, index) {
            if (!row.classList.contains('loading') && row.dataset.animation !== 'update_remove' && row.dataset.animation !== 'hide') {
                callback(row, index + _this.visible.first);
            }
            if (!inplace) {
                fragment.appendChild(row);
            }
        });
        if (!inplace) {
            this.body.appendChild(fragment);
        }
    };
    ARowRenderer.prototype.removeFromBeginning = function (from, to) {
        return this.remove(from, to, true);
    };
    ARowRenderer.prototype.removeFromBottom = function (from, to) {
        return this.remove(from, to, false);
    };
    ARowRenderer.prototype.remove = function (from, to, fromBeginning) {
        if (to < from) {
            return;
        }
        for (var i = from; i <= to; ++i) {
            var item = (fromBeginning ? this.body.firstChild : this.body.lastChild);
            item.remove();
            this.recycle(item);
        }
    };
    ARowRenderer.prototype.addAtBeginning = function (from, to) {
        if (to < from) {
            return;
        }
        if (from === to) {
            this.body.insertBefore(this.create(from), this.body.firstChild);
            return;
        }
        var fragment = this.fragment;
        for (var i = from; i <= to; ++i) {
            fragment.appendChild(this.create(i));
        }
        this.body.insertBefore(fragment, this.body.firstChild);
    };
    ARowRenderer.prototype.addAtBottom = function (from, to) {
        if (to < from) {
            return;
        }
        if (from === to) {
            this.body.appendChild(this.create(from));
            return;
        }
        var fragment = this.fragment;
        for (var i = from; i <= to; ++i) {
            fragment.appendChild(this.create(i));
        }
        this.body.appendChild(fragment);
    };
    ARowRenderer.prototype.updateOffset = function (firstRowPos) {
        this.visibleFirstRowPos = firstRowPos;
        this.body.classList.toggle('odd', this.visible.first % 2 === 1);
        this.updateSizer(firstRowPos);
    };
    ARowRenderer.prototype.updateSizer = function (firstRowPos) {
        var totalHeight = this.context.totalHeight;
        this.body.style.transform = "translate(0, " + firstRowPos.toFixed(0) + "px)";
        this.bodySizer.style.transform = "translate(0, " + Math.max(0, totalHeight - 1).toFixed(0) + "px)";
    };
    ARowRenderer.prototype.recreate = function (ctx) {
        this.abortAnimation();
        if (ctx) {
            return this.recreateAnimated(ctx);
        }
        return this.recreatePure();
    };
    ARowRenderer.prototype.recreatePure = function () {
        var context = this.context;
        var scroller = this.bodyScroller;
        this.updateOffset(0);
        this.removeAll();
        this.clearPool();
        var _a = range(scroller.scrollTop, scroller.clientHeight, context.defaultRowHeight, context.exceptions, context.numberOfRows), first = _a.first, last = _a.last, firstRowPos = _a.firstRowPos;
        this.visible.first = this.visible.forcedFirst = first;
        this.visible.last = this.visible.forcedLast = last;
        if (first < 0) {
            this.updateOffset(0);
            return;
        }
        this.addAtBottom(first, last);
        this.updateOffset(firstRowPos);
    };
    ARowRenderer.prototype.recreateAnimated = function (ctx) {
        var _this = this;
        var lookup = new Map();
        var prev = new KeyFinder(ctx.previous, ctx.previousKey);
        var cur = new KeyFinder(this.context, ctx.currentKey);
        var next = range(this.bodyScroller.scrollTop, this.bodyScroller.clientHeight, cur.context.defaultRowHeight, cur.context.exceptions, cur.context.numberOfRows);
        {
            var rows_1 = Array.from(this.body.children);
            var old = Object.assign({}, this.visible);
            this.body.innerHTML = "";
            prev.positions(old.first, Math.min(old.last, old.first + rows_1.length), this.visibleFirstRowPos, function (i, key, pos) {
                var n = rows_1[i];
                if (n) {
                    lookup.set(key, { n: n, pos: pos, i: i });
                }
            });
        }
        this.visible.first = this.visible.forcedFirst = next.first;
        this.visible.last = this.visible.forcedLast = next.last;
        var fragment = this.fragment;
        var animation = [];
        var nodeY = next.firstRowPos;
        cur.positions(next.first, next.last, next.firstRowPos, function (i, key, pos) {
            var node;
            var mode = EAnimationMode.UPDATE;
            var previous;
            if (lookup.has(key)) {
                var item = lookup.get(key);
                lookup.delete(key);
                item.n.dataset.index = String(i);
                node = _this.proxy(item.n, _this.updateRow(item.n, i));
                previous = {
                    index: item.i,
                    y: item.pos,
                    height: prev.exceptionHeightOf(item.i, true)
                };
            }
            else {
                var old = prev.posByKey(key);
                node = _this.create(i);
                mode = old.index < 0 ? EAnimationMode.SHOW : EAnimationMode.UPDATE_CREATE;
                previous = {
                    index: old.index,
                    y: old.pos >= 0 ? old.pos : pos,
                    height: old.index < 0 ? cur.exceptionHeightOf(i, true) : prev.exceptionHeightOf(old.index, true)
                };
            }
            animation.push({
                node: node,
                key: key,
                mode: mode,
                previous: previous,
                nodeY: nodeY,
                nodeYCurrentHeight: pos,
                current: {
                    index: i,
                    y: pos,
                    height: cur.exceptionHeightOf(i)
                }
            });
            node.style.transform = "translate(0, " + (nodeY - pos) + "px)";
            nodeY += previous.height + (previous.index < 0 ? cur.padding(i) : prev.padding(previous.index));
            fragment.appendChild(node);
        });
        var nodeYCurrentHeight = next.endPos;
        lookup.forEach(function (item, key) {
            var r = cur.posByKey(key);
            var nextPos = r.pos >= 0 ? r.pos : item.pos;
            var node = item.n;
            node.style.transform = "translate(0, " + (item.pos - nodeY) + "px)";
            fragment.appendChild(node);
            var prevHeight = prev.exceptionHeightOf(item.i, true);
            animation.push({
                node: item.n,
                key: key,
                mode: r.index < 0 ? EAnimationMode.HIDE : EAnimationMode.UPDATE_REMOVE,
                previous: {
                    index: item.i,
                    y: item.pos,
                    height: prevHeight
                },
                nodeY: nodeY,
                nodeYCurrentHeight: nodeYCurrentHeight,
                current: {
                    index: r.index,
                    y: nextPos,
                    height: r.index < 0 ? null : cur.exceptionHeightOf(r.index)
                }
            });
            nodeYCurrentHeight += r.index < 0 ? cur.context.defaultRowHeight : (cur.exceptionHeightOf(r.index, true) + cur.padding(r.index));
            nodeY += prevHeight + prev.padding(item.i);
        });
        this.updateOffset(next.firstRowPos);
        this.animate(animation, ctx.phases || defaultPhases, prev, cur, fragment);
    };
    ARowRenderer.prototype.animate = function (animation, phases, previousFinder, currentFinder, fragment) {
        var _this = this;
        if (animation.length <= 0) {
            this.body.appendChild(fragment);
            return;
        }
        var currentTimer = -1;
        var actPhase = 0;
        var executePhase = function (phase, items) {
            if (items === void 0) { items = animation; }
            items.forEach(function (anim) { return phase.apply(anim, previousFinder, currentFinder); });
        };
        var run = function () {
            console.assert(animation[0].node.offsetTop >= 0, 'dummy log for forcing dom update');
            executePhase(phases[actPhase++]);
            if (actPhase < phases.length) {
                var next = phases[actPhase];
                currentTimer = self.setTimeout(run, next.delay);
                return;
            }
            var body = _this.body.classList;
            Array.from(body).forEach(function (v) {
                if (v.startsWith('le-') && v.endsWith('-animation')) {
                    body.remove(v);
                }
            });
            animation.forEach(function (_a) {
                var node = _a.node, mode = _a.mode;
                if (mode !== EAnimationMode.UPDATE_REMOVE && mode !== EAnimationMode.HIDE) {
                    return;
                }
                node.remove();
                node.style.transform = null;
                _this.recycle(node);
            });
            _this.abortAnimation = function () { return undefined; };
            currentTimer = -1;
        };
        while (phases[actPhase].delay === 0) {
            executePhase(phases[actPhase++]);
        }
        var body = this.body;
        this.body.appendChild(fragment);
        var dummyAnimation = [];
        animation = animation.filter(function (d) {
            if (noAnimationChange(d, previousFinder.context.defaultRowHeight, currentFinder.context.defaultRowHeight)) {
                dummyAnimation.push(d);
                return false;
            }
            return true;
        });
        if (dummyAnimation.length > 0) {
            phases.slice(actPhase).forEach(function (phase) { return executePhase(phase, dummyAnimation); });
        }
        if (animation.length === 0) {
            return;
        }
        body.classList.add('le-row-animation');
        (new Set(animation.map(function (d) { return d.mode; }))).forEach(function (mode) {
            body.classList.add("le-" + EAnimationMode[mode].toLowerCase().split('_')[0] + "-animation");
        });
        this.abortAnimation = function () {
            if (currentTimer <= 0) {
                return;
            }
            clearTimeout(currentTimer);
            currentTimer = -1;
            actPhase = phases.length - 1;
            run();
        };
        currentTimer = self.setTimeout(run, phases[actPhase].delay);
    };
    ARowRenderer.prototype.clearPool = function () {
        this.pool.splice(0, this.pool.length);
    };
    ARowRenderer.prototype.revalidate = function () {
        var scroller = this.bodyScroller;
        this.onScrolledVertically(scroller.scrollTop, scroller.clientHeight, true);
        this.updateOffset(this.visibleFirstRowPos);
    };
    ARowRenderer.prototype.onScrolledVertically = function (scrollTop, clientHeight, isGoingDown) {
        var scrollResult = this.onScrolledImpl(scrollTop, clientHeight);
        this.mixins.forEach(function (mixin) { return mixin.onScrolled(isGoingDown, scrollResult); });
        return scrollResult;
    };
    ARowRenderer.prototype.shiftLast = function (current, currentDelta) {
        var b = this.options.batchSize;
        if (currentDelta >= b) {
            return current;
        }
        var total = this.context.numberOfRows;
        return Math.min(total - 1, current + (this.options.batchSize - currentDelta));
    };
    ARowRenderer.prototype.shiftFirst = function (current, currentFirstRow, currentDelta) {
        var b = this.options.batchSize;
        if (currentDelta >= b || current <= 0) {
            return { first: current, firstRowPos: currentFirstRow };
        }
        var first = Math.max(0, current - (this.options.batchSize - currentDelta));
        var _a = this.context, exceptionsLookup = _a.exceptionsLookup, defaultRowHeight = _a.defaultRowHeight;
        var firstRowPos = currentFirstRow;
        for (var i = first; i < current; ++i) {
            if (exceptionsLookup.has(i)) {
                firstRowPos -= exceptionsLookup.get(i);
            }
            else {
                firstRowPos -= defaultRowHeight;
            }
        }
        return { first: first, firstRowPos: firstRowPos };
    };
    ARowRenderer.prototype.onScrolledImpl = function (scrollTop, clientHeight) {
        var context = this.context;
        var _a = range(scrollTop, clientHeight, context.defaultRowHeight, context.exceptions, context.numberOfRows), first = _a.first, last = _a.last, firstRowPos = _a.firstRowPos;
        var visible = this.visible;
        visible.forcedFirst = first;
        visible.forcedLast = last;
        if ((first - visible.first) >= 0 && (last - visible.last) <= 0) {
            return EScrollResult.NONE;
        }
        var r = EScrollResult.SOME;
        if (first > visible.last || last < visible.first) {
            this.removeAll();
            this.addAtBottom(first, last);
            r = EScrollResult.ALL;
        }
        else if (first < visible.first) {
            var toRemove = visible.last - (last + 1);
            if (toRemove >= this.options.batchSize) {
                this.removeFromBottom(last + 1, visible.last);
            }
            else {
                last = visible.last;
            }
            var shift = this.shiftFirst(first, firstRowPos, visible.first - 1 - first);
            first = shift.first;
            firstRowPos = shift.firstRowPos;
            this.addAtBeginning(first, visible.first - 1);
            r = EScrollResult.SOME_TOP;
        }
        else {
            var toRemove = first - 1 - visible.first;
            if (toRemove >= this.options.batchSize) {
                this.removeFromBeginning(visible.first, first - 1);
            }
            else {
                first = visible.first;
                firstRowPos = this.visibleFirstRowPos;
            }
            last = this.shiftLast(last, last - visible.last + 1);
            this.addAtBottom(visible.last + 1, last);
            r = EScrollResult.SOME_BOTTOM;
        }
        visible.first = first;
        visible.last = last;
        this.updateOffset(firstRowPos);
        return r;
    };
    return ARowRenderer;
}());
export { ARowRenderer };
export default ARowRenderer;
//# sourceMappingURL=ARowRenderer.js.map