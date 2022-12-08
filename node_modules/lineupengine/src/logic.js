var RowHeightException = (function () {
    function RowHeightException(index, y, height) {
        this.index = index;
        this.y = y;
        this.height = height;
    }
    Object.defineProperty(RowHeightException.prototype, "y2", {
        get: function () {
            return this.y + this.height;
        },
        enumerable: true,
        configurable: true
    });
    return RowHeightException;
}());
export function uniformContext(numberOfRows, rowHeight, rowPadding) {
    if (rowPadding === void 0) { rowPadding = 0; }
    rowHeight += rowPadding;
    var exceptionsLookup = {
        keys: function () { return [].values(); },
        get: function () { return rowHeight; },
        has: function () { return false; },
        size: 0
    };
    return {
        exceptions: [],
        exceptionsLookup: exceptionsLookup,
        totalHeight: numberOfRows * rowHeight,
        numberOfRows: numberOfRows,
        defaultRowHeight: rowHeight,
        padding: function () { return rowPadding; }
    };
}
function mostFrequentValue(values) {
    var lookup = new Map();
    values.forEach(function (value) {
        lookup.set(value, (lookup.get(value) || 0) + 1);
    });
    if (lookup.size === 0) {
        return 20;
    }
    var sorted = Array.from(lookup).sort(function (a, b) {
        if (a[1] !== b[1]) {
            return b[1] - a[1];
        }
        return a[0] - b[0];
    });
    var mostFrequent = sorted[0][0];
    if (mostFrequent === 0) {
        return sorted.length > 1 ? sorted[1][0] : 20;
    }
    return mostFrequent;
}
export function nonUniformContext(rowHeights, defaultRowHeight, rowPadding) {
    if (defaultRowHeight === void 0) { defaultRowHeight = NaN; }
    if (rowPadding === void 0) { rowPadding = 0; }
    var exceptionsLookup = new Map();
    var exceptions = [];
    var padding = typeof rowPadding === 'function' ? rowPadding : function () { return rowPadding; };
    if (isNaN(defaultRowHeight)) {
        defaultRowHeight = mostFrequentValue(rowHeights);
    }
    defaultRowHeight += padding(-1);
    var prev = -1, acc = 0, totalHeight = 0, numberOfRows = 0;
    rowHeights.forEach(function (height, index) {
        height += padding(index);
        totalHeight += height;
        numberOfRows++;
        if (height === defaultRowHeight) {
            return;
        }
        exceptionsLookup.set(index, height);
        var between = (index - prev - 1) * defaultRowHeight;
        prev = index;
        var y = acc + between;
        acc = y + height;
        exceptions.push(new RowHeightException(index, y, height));
    });
    return { exceptionsLookup: exceptionsLookup, exceptions: exceptions, totalHeight: totalHeight, defaultRowHeight: defaultRowHeight, numberOfRows: numberOfRows, padding: padding };
}
export function randomContext(numberOfRows, defaultRowHeight, minRowHeight, maxRowHeight, ratio, seed) {
    if (minRowHeight === void 0) { minRowHeight = 2; }
    if (maxRowHeight === void 0) { maxRowHeight = defaultRowHeight * 10; }
    if (ratio === void 0) { ratio = 0.2; }
    if (seed === void 0) { seed = Date.now(); }
    var actSeed = seed;
    var random = function () {
        var x = Math.sin(actSeed++) * 10000;
        return x - Math.floor(x);
    };
    var getter = function () {
        var coin = random();
        if (coin < ratio) {
            return minRowHeight + Math.round(random() * (maxRowHeight - minRowHeight));
        }
        return defaultRowHeight;
    };
    var forEach = function (callback) {
        for (var index = 0; index < numberOfRows; ++index) {
            callback(getter(), index);
        }
    };
    return nonUniformContext({ forEach: forEach }, defaultRowHeight);
}
export function range(scrollTop, clientHeight, rowHeight, heightExceptions, numberOfRows) {
    if (numberOfRows === 0) {
        return { first: 0, last: -1, firstRowPos: 0, endPos: 0 };
    }
    if (numberOfRows === 1) {
        return {
            first: 0,
            last: 0,
            firstRowPos: 0,
            endPos: heightExceptions.length === 0 ? rowHeight : heightExceptions[0].y2
        };
    }
    var offset = scrollTop;
    var offset2 = offset + clientHeight;
    function indexOf(pos, indexShift) {
        return Math.min(numberOfRows - 1, indexShift + Math.max(0, Math.floor(pos / rowHeight)));
    }
    function calc(offsetShift, indexShift, isGuess) {
        if (isGuess === void 0) { isGuess = false; }
        var shifted = offset - offsetShift;
        var shifted2 = offset2 - offsetShift;
        var first = indexOf(shifted, indexShift);
        var last = indexOf(shifted2, indexShift);
        var firstRowPos = offsetShift + (first - indexShift) * rowHeight;
        var endPos = offsetShift + (last + 1 - indexShift) * rowHeight;
        console.assert(!isGuess || !(firstRowPos > offset || (endPos < offset2 && last < numberOfRows - 1)), 'error', isGuess, firstRowPos, endPos, offset, offset2, indexShift, offsetShift);
        return { first: first, last: last, firstRowPos: firstRowPos, endPos: endPos };
    }
    var r = calc(0, 0, true);
    if (heightExceptions.length === 0) {
        return r;
    }
    if (r.last < heightExceptions[0].index) {
        return r;
    }
    if (r.last === heightExceptions[0].index && heightExceptions[0].height > rowHeight) {
        return Object.assign(r, { endPos: heightExceptions[0].y2 });
    }
    var lastPos = heightExceptions[heightExceptions.length - 1];
    if (offset >= lastPos.y) {
        var rest = calc(lastPos.y2, lastPos.index + 1);
        if (offset < lastPos.y2) {
            return Object.assign(rest, { first: lastPos.index, firstRowPos: lastPos.y });
        }
        return rest;
    }
    var visible = [];
    var closest = heightExceptions[0];
    for (var _i = 0, heightExceptions_1 = heightExceptions; _i < heightExceptions_1.length; _i++) {
        var item = heightExceptions_1[_i];
        var y = item.y, y2 = item.y2;
        if (y >= offset2) {
            break;
        }
        if (y2 <= offset) {
            closest = item;
            continue;
        }
        visible.push(item);
    }
    if (visible.length === 0) {
        return calc(closest.y2, closest.index + 1);
    }
    {
        var firstException = visible[0];
        var lastException = visible[visible.length - 1];
        var first = Math.max(0, firstException.index - Math.max(0, Math.ceil((firstException.y - offset) / rowHeight)));
        var last = lastException.index;
        if (offset2 >= lastException.y2) {
            last = indexOf(offset2 - lastException.y2, lastException.index + 1);
        }
        var firstRowPos = firstException.y - (firstException.index - first) * rowHeight;
        var endPos = lastException.y2 + (last - lastException.index) * rowHeight;
        console.assert(firstRowPos <= offset && (endPos >= offset2 || last === numberOfRows - 1), 'error', firstRowPos, endPos, offset, offset2, firstException, lastException);
        return { first: first, last: last, firstRowPos: firstRowPos, endPos: endPos };
    }
}
export function frozenDelta(current, target) {
    var clength = current.length;
    var tlength = target.length;
    if (clength === 0) {
        return { added: target, removed: [], common: 0 };
    }
    if (tlength === 0) {
        return { added: [], removed: current, common: 0 };
    }
    if (clength === tlength) {
        return { added: [], removed: [], common: clength };
    }
    var removed = current.slice(Math.min(tlength, clength));
    var added = target.slice(Math.min(tlength, clength));
    return { added: added, removed: removed, common: clength - removed.length };
}
export function updateFrozen(old, columns, first) {
    var oldLast = old.length === 0 ? 0 : old[old.length - 1] + 1;
    var added = [];
    var removed = [];
    for (var i = old.length - 1; i >= 0; --i) {
        var index = old[i];
        if (index >= first) {
            removed.push(old.pop());
        }
        else {
            break;
        }
    }
    for (var i = oldLast; i < first; ++i) {
        if (columns[i].frozen) {
            added.push(i);
            old.push(i);
        }
    }
    return { target: old, added: added, removed: removed };
}
//# sourceMappingURL=logic.js.map