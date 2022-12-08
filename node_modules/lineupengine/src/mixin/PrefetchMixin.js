import { range } from '../logic';
import { EScrollResult } from './IMixin';
var PrefetchMixin = (function () {
    function PrefetchMixin(adapter, options) {
        this.adapter = adapter;
        this.prefetchTimeout = -1;
        this.cleanupTimeout = -1;
        this.options = {
            prefetchRows: 20,
            cleanUpRows: 3,
            delay: 50
        };
        Object.assign(this.options, options);
        return this;
    }
    PrefetchMixin.prototype.prefetchDown = function () {
        this.prefetchTimeout = -1;
        var context = this.adapter.context;
        var nextLast = Math.min(this.adapter.visible.forcedLast + this.options.prefetchRows, context.numberOfRows - 1);
        if (this.adapter.visible.last === nextLast && this.adapter.visible.last >= (this.adapter.visible.forcedLast + this.options.prefetchRows)) {
            return;
        }
        this.adapter.addAtBottom(this.adapter.visible.last + 1, nextLast);
        this.adapter.visible.last = nextLast;
    };
    PrefetchMixin.prototype.prefetchUp = function () {
        this.prefetchTimeout = -1;
        if (this.adapter.visible.first <= (this.adapter.visible.forcedFirst - this.options.prefetchRows)) {
            return;
        }
        var context = this.adapter.context;
        var scroller = this.adapter.scroller;
        var fakeOffset = Math.max(scroller.scrollTop - this.options.prefetchRows * context.defaultRowHeight, 0);
        var height = scroller.clientHeight;
        var _a = range(fakeOffset, height, context.defaultRowHeight, context.exceptions, context.numberOfRows), first = _a.first, firstRowPos = _a.firstRowPos;
        if (first === this.adapter.visible.first) {
            return;
        }
        var frozenShift = this.adapter.syncFrozen ? this.adapter.syncFrozen(first) : 0;
        this.adapter.addAtBeginning(first, this.adapter.visible.first - 1, frozenShift);
        this.adapter.visible.first = first;
        this.adapter.updateOffset(firstRowPos);
    };
    PrefetchMixin.prototype.triggerPrefetch = function (isGoingDown) {
        if (this.prefetchTimeout >= 0) {
            clearTimeout(this.prefetchTimeout);
        }
        var prefetchDownPossible = this.adapter.visible.last < (this.adapter.visible.forcedLast + this.options.prefetchRows);
        var prefetchUpPossible = this.adapter.visible.first > (this.adapter.visible.forcedFirst - this.options.prefetchRows);
        var isLast = this.adapter.visible.last === this.adapter.context.numberOfRows;
        var isFirst = this.adapter.visible.first === 0;
        if ((isGoingDown && !prefetchDownPossible && !isLast) || (!isGoingDown && !prefetchUpPossible && !isFirst)) {
            return;
        }
        var op = (isGoingDown || isFirst) ? this.prefetchDown.bind(this) : this.prefetchUp.bind(this);
        this.prefetchTimeout = self.setTimeout(op, this.options.delay);
    };
    PrefetchMixin.prototype.cleanUpTop = function (first) {
        this.cleanupTimeout = -1;
        var newFirst = Math.max(0, first - this.options.cleanUpRows);
        if (newFirst <= this.adapter.visible.first) {
            return;
        }
        var frozenShift = this.adapter.syncFrozen ? this.adapter.syncFrozen(newFirst) : 0;
        this.adapter.removeFromBeginning(this.adapter.visible.first, newFirst - 1, frozenShift);
        var context = this.adapter.context;
        var shift = (newFirst - this.adapter.visible.first) * context.defaultRowHeight;
        if (context.exceptions.length > 0) {
            for (var i = this.adapter.visible.first; i < newFirst; ++i) {
                if (context.exceptionsLookup.has(i)) {
                    shift += context.exceptionsLookup.get(i) - context.defaultRowHeight;
                }
            }
        }
        this.adapter.visible.first = newFirst;
        this.adapter.updateOffset(this.adapter.visibleFirstRowPos + shift);
        this.prefetchDown();
    };
    PrefetchMixin.prototype.cleanUpBottom = function (last) {
        this.cleanupTimeout = -1;
        var newLast = last + this.options.cleanUpRows;
        if (this.adapter.visible.last <= newLast) {
            return;
        }
        this.adapter.removeFromBottom(newLast + 1, this.adapter.visible.last);
        this.adapter.visible.last = newLast;
        this.prefetchUp();
    };
    PrefetchMixin.prototype.triggerCleanUp = function (first, last, isGoingDown) {
        if (this.cleanupTimeout >= 0) {
            clearTimeout(this.cleanupTimeout);
        }
        if ((isGoingDown && (first - this.options.cleanUpRows) <= this.adapter.visible.first) || (!isGoingDown && this.adapter.visible.last <= (last + this.options.cleanUpRows))) {
            return;
        }
        this.cleanupTimeout = self.setTimeout(isGoingDown ? this.cleanUpTop.bind(this) : this.cleanUpBottom.bind(this), this.options.delay, isGoingDown ? first : last);
    };
    PrefetchMixin.prototype.onScrolled = function (isGoingDown, scrollResult) {
        if (scrollResult !== EScrollResult.ALL && this.options.cleanUpRows > 0) {
            this.triggerCleanUp(this.adapter.visible.forcedFirst, this.adapter.visible.forcedLast, isGoingDown);
        }
        if (scrollResult !== EScrollResult.NONE && this.options.prefetchRows > 0) {
            this.triggerPrefetch(isGoingDown);
        }
    };
    return PrefetchMixin;
}());
export default PrefetchMixin;
//# sourceMappingURL=PrefetchMixin.js.map