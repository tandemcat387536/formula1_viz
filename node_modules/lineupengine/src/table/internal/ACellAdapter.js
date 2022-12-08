import { range, updateFrozen } from '../../logic';
import { EScrollResult } from '../../mixin';
import { setColumn } from '../../style/GridStyleManager';
var debug = false;
var ACellAdapter = (function () {
    function ACellAdapter(header, style, tableId) {
        var mixinClasses = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            mixinClasses[_i - 3] = arguments[_i];
        }
        var _this = this;
        this.header = header;
        this.style = style;
        this.tableId = tableId;
        this.cellPool = [];
        this.visibleColumns = {
            frozen: [],
            first: 0,
            forcedFirst: 0,
            last: -1,
            forcedLast: -1
        };
        this.visibleFirstColumnPos = 0;
        this.columnAdapter = this.createColumnAdapter();
        this.columnMixins = mixinClasses.map(function (mixinClass) { return new mixinClass(_this.columnAdapter); });
        this.columnFragment = header.ownerDocument.createDocumentFragment();
    }
    ACellAdapter.prototype.leftShift = function () {
        var ctx = this.context;
        var frozen = this.visibleColumns.frozen.reduce(function (a, d) { return a + ctx.columns[d].width + ctx.column.padding(d); }, 0);
        return this.visibleFirstColumnPos - frozen;
    };
    Object.defineProperty(ACellAdapter.prototype, "headerScroller", {
        get: function () {
            return this.header.parentElement;
        },
        enumerable: true,
        configurable: true
    });
    ACellAdapter.prototype.addColumnMixin = function (mixinClass, options) {
        this.columnMixins.push(new mixinClass(this.columnAdapter, options));
    };
    ACellAdapter.prototype.createColumnAdapter = function () {
        var _this = this;
        var r = {
            visible: this.visibleColumns,
            addAtBeginning: this.addColumnAtStart.bind(this),
            addAtBottom: this.addColumnAtEnd.bind(this),
            removeFromBeginning: this.removeColumnFromStart.bind(this),
            removeFromBottom: this.removeColumnFromEnd.bind(this),
            updateOffset: this.updateColumnOffset.bind(this),
            scroller: this.headerScroller,
            syncFrozen: this.syncFrozen.bind(this)
        };
        Object.defineProperties(r, {
            visibleFirstRowPos: {
                get: function () { return _this.visibleFirstColumnPos; },
                enumerable: true
            },
            context: {
                get: function () { return _this.context.column; },
                enumerable: true
            },
        });
        return r;
    };
    ACellAdapter.prototype.init = function () {
        var _this = this;
        var context = this.context;
        this.style.update(context.defaultRowHeight - context.padding(-1), context.columns, 0, this.tableId);
        context.columns.forEach(function () {
            _this.cellPool.push([]);
        });
    };
    ACellAdapter.prototype.onScrolledHorizontally = function (scrollLeft, clientWidth, isGoingRight) {
        var scrollResult = this.onScrolledHorizontallyImpl(scrollLeft, clientWidth);
        this.columnMixins.forEach(function (mixin) { return mixin.onScrolled(isGoingRight, scrollResult); });
        return scrollResult;
    };
    ACellAdapter.prototype.removeColumnFromStart = function (from, to, frozenShift) {
        var _this = this;
        if (frozenShift === void 0) { frozenShift = this.visibleColumns.frozen.length; }
        this.forEachRow(function (row) {
            _this.removeCellFromStart(row, from, to, frozenShift);
        });
        if (debug) {
            this.verifyRows();
        }
    };
    ACellAdapter.prototype.removeCellFromStart = function (row, from, to, frozenShift) {
        for (var i = from; i <= to; ++i) {
            var node = (frozenShift === 0 ? row.firstElementChild : row.children[frozenShift]);
            node.remove();
            this.recycleCell(node, i);
        }
        if (debug) {
            verifyRow(row, -1, this.context.columns);
        }
    };
    ACellAdapter.prototype.removeColumnFromEnd = function (from, to) {
        var _this = this;
        this.forEachRow(function (row) {
            _this.removeCellFromEnd(row, from, to);
        });
        if (debug) {
            this.verifyRows();
        }
    };
    ACellAdapter.prototype.removeCellFromEnd = function (row, from, to) {
        for (var i = to; i >= from; --i) {
            var node = row.lastElementChild;
            node.remove();
            this.recycleCell(node, i);
        }
        if (debug) {
            verifyRow(row, -1, this.context.columns);
        }
    };
    ACellAdapter.prototype.removeFrozenCells = function (row, columnIndices, shift) {
        for (var _i = 0, columnIndices_1 = columnIndices; _i < columnIndices_1.length; _i++) {
            var columnIndex = columnIndices_1[_i];
            var node = row.children[shift];
            node.remove();
            this.recycleCell(node, columnIndex);
        }
        if (debug) {
            verifyRow(row, -1, this.context.columns);
        }
    };
    ACellAdapter.prototype.removeFrozenColumns = function (columnIndices, shift) {
        var _this = this;
        this.forEachRow(function (row) {
            _this.removeFrozenCells(row, columnIndices, shift);
        });
        if (debug) {
            this.verifyRows();
        }
    };
    ACellAdapter.prototype.removeAllColumns = function (includingFrozen) {
        var _this = this;
        this.forEachRow(function (row) {
            _this.removeAllCells(row, includingFrozen);
        });
        if (debug) {
            this.verifyRows();
        }
    };
    ACellAdapter.prototype.removeAllCells = function (row, includingFrozen, shift) {
        var _this = this;
        if (shift === void 0) { shift = this.visibleColumns.first; }
        var arr = Array.from(row.children);
        var frozen = this.visibleColumns.frozen;
        row.innerHTML = '';
        if (includingFrozen || frozen.length === 0) {
            for (var _i = 0, frozen_1 = frozen; _i < frozen_1.length; _i++) {
                var i = frozen_1[_i];
                this.recycleCell(arr.shift(), i);
            }
        }
        else {
            for (var _a = 0, frozen_2 = frozen; _a < frozen_2.length; _a++) {
                var _1 = frozen_2[_a];
                row.appendChild(arr.shift());
            }
        }
        arr.forEach(function (item, i) {
            _this.recycleCell(item, i + shift);
        });
        if (debug) {
            verifyRow(row, -1, this.context.columns);
        }
    };
    ACellAdapter.prototype.selectCell = function (row, column, columns) {
        var pool = this.cellPool[column];
        var columnObj = columns[column];
        if (pool.length > 0) {
            var item = pool.pop();
            var r_1 = this.updateCell(item, row, columnObj);
            if (r_1 && r_1 !== item) {
                setColumn(r_1, columnObj);
            }
            return r_1 ? r_1 : item;
        }
        var r = this.createCell(this.header.ownerDocument, row, columnObj);
        setColumn(r, columnObj);
        return r;
    };
    ACellAdapter.prototype.recycleCell = function (item, column) {
        this.cellPool[column].push(item);
    };
    ACellAdapter.prototype.addColumnAtStart = function (from, to, frozenShift) {
        var _this = this;
        if (frozenShift === void 0) { frozenShift = this.visibleColumns.frozen.length; }
        var columns = this.context.columns;
        this.forEachRow(function (row, rowIndex) {
            _this.addCellAtStart(row, rowIndex, from, to, frozenShift, columns);
        });
        if (debug) {
            this.verifyRows();
        }
    };
    ACellAdapter.prototype.addCellAtStart = function (row, rowIndex, from, to, frozenShift, columns) {
        if (debug) {
            verifyRow(row, rowIndex, this.context.columns);
        }
        for (var i = to; i >= from; --i) {
            var cell = this.selectCell(rowIndex, i, columns);
            row.insertBefore(cell, frozenShift > 0 ? row.children[frozenShift] : row.firstChild);
        }
        if (debug) {
            verifyRow(row, rowIndex, this.context.columns);
        }
    };
    ACellAdapter.prototype.insertFrozenCells = function (row, rowIndex, columnIndices, shift, columns) {
        var before = row.children[shift];
        for (var _i = 0, columnIndices_2 = columnIndices; _i < columnIndices_2.length; _i++) {
            var i = columnIndices_2[_i];
            var cell = this.selectCell(rowIndex, i, columns);
            if (before) {
                row.insertBefore(cell, before);
            }
            else {
                row.appendChild(cell);
            }
        }
    };
    ACellAdapter.prototype.insertFrozenColumns = function (columnIndices, shift) {
        var _this = this;
        var columns = this.context.columns;
        this.forEachRow(function (row, rowIndex) {
            _this.insertFrozenCells(row, rowIndex, columnIndices, shift, columns);
        });
    };
    ACellAdapter.prototype.addColumnAtEnd = function (from, to) {
        var _this = this;
        var columns = this.context.columns;
        this.forEachRow(function (row, rowIndex) {
            _this.addCellAtEnd(row, rowIndex, from, to, columns);
        });
        if (debug) {
            this.verifyRows();
        }
    };
    ACellAdapter.prototype.verifyRows = function () {
        var columns = this.context.columns;
        this.forEachRow(function (row, rowIndex) { return verifyRow(row, rowIndex, columns); });
    };
    ACellAdapter.prototype.addCellAtEnd = function (row, rowIndex, from, to, columns) {
        for (var i = from; i <= to; ++i) {
            var cell = this.selectCell(rowIndex, i, columns);
            row.appendChild(cell);
        }
        if (debug) {
            verifyRow(row, rowIndex, this.context.columns);
        }
    };
    ACellAdapter.prototype.updateHeaders = function () {
        var _this = this;
        var columns = this.context.columns;
        Array.from(this.header.children).forEach(function (node, i) {
            _this.updateHeader(node, columns[i]);
        });
    };
    ACellAdapter.prototype.recreate = function (left, width) {
        var _this = this;
        var context = this.context;
        this.style.update(context.defaultRowHeight - context.padding(-1), context.columns, -this.leftShift(), this.tableId);
        this.clearPool();
        for (var i = this.cellPool.length; i < context.columns.length; ++i) {
            this.cellPool.push([]);
        }
        {
            var fragment_1 = this.columnFragment;
            var document_1 = fragment_1.ownerDocument;
            this.header.innerHTML = '';
            context.columns.forEach(function (col) {
                var n = _this.createHeader(document_1, col);
                setColumn(n, col);
                fragment_1.appendChild(n);
            });
            this.header.appendChild(fragment_1);
        }
        var _a = range(left, width, context.column.defaultRowHeight, context.column.exceptions, context.column.numberOfRows), first = _a.first, last = _a.last, firstRowPos = _a.firstRowPos;
        this.visibleColumns.first = this.visibleColumns.forcedFirst = first;
        this.visibleColumns.last = this.visibleColumns.forcedLast = last;
        if (context.columns.some(function (c) { return c.frozen; })) {
            var target = updateFrozen([], context.columns, first).target;
            this.visibleColumns.frozen = target;
        }
        else {
            this.visibleColumns.frozen = [];
        }
        this.updateColumnOffset(firstRowPos);
    };
    ACellAdapter.prototype.clearPool = function () {
        this.cellPool.forEach(function (p) { return p.splice(0, p.length); });
    };
    ACellAdapter.prototype.updateColumnOffset = function (firstColumnPos) {
        var changed = firstColumnPos !== this.visibleFirstColumnPos;
        this.visibleFirstColumnPos = firstColumnPos;
        if (changed) {
            var context = this.context;
            this.style.update(context.defaultRowHeight - context.padding(-1), context.columns, -this.leftShift(), this.tableId);
        }
    };
    ACellAdapter.prototype.createRow = function (node, rowIndex) {
        var columns = this.context.columns;
        var visible = this.visibleColumns;
        if (visible.frozen.length > 0) {
            for (var _i = 0, _a = visible.frozen; _i < _a.length; _i++) {
                var i = _a[_i];
                var cell = this.selectCell(rowIndex, i, columns);
                node.appendChild(cell);
            }
        }
        for (var i = visible.first; i <= visible.last; ++i) {
            var cell = this.selectCell(rowIndex, i, columns);
            node.appendChild(cell);
        }
    };
    ACellAdapter.prototype.updateRow = function (node, rowIndex) {
        var columns = this.context.columns;
        var visible = this.visibleColumns;
        var existing = Array.from(node.children);
        switch (existing.length) {
            case 0:
                if (visible.frozen.length > 0) {
                    this.insertFrozenCells(node, rowIndex, visible.frozen, 0, columns);
                }
                this.addCellAtEnd(node, rowIndex, visible.first, visible.last, columns);
                break;
            case 1:
                var old = existing[0];
                var id_1 = old.dataset.id;
                var columnIndex = columns.findIndex(function (c) { return c.id === id_1; });
                node.removeChild(old);
                if (columnIndex >= 0) {
                    this.recycleCell(old, columnIndex);
                }
                if (visible.frozen.length > 0) {
                    this.insertFrozenCells(node, rowIndex, visible.frozen, 0, columns);
                }
                this.addCellAtEnd(node, rowIndex, visible.first, visible.last, columns);
                break;
            default:
                this.mergeColumns(node, rowIndex, existing);
                break;
        }
    };
    ACellAdapter.prototype.mergeColumns = function (node, rowIndex, existing) {
        var _this = this;
        var columns = this.context.columns;
        var visible = this.visibleColumns;
        node.innerHTML = '';
        var ids = new Map(existing.map(function (e) { return [e.dataset.id, e]; }));
        var updateImpl = function (i) {
            var col = columns[i];
            var existing = ids.get(col.id);
            if (!existing) {
                var cell_1 = _this.selectCell(rowIndex, i, columns);
                node.appendChild(cell_1);
                return;
            }
            var cell = _this.updateCell(existing, rowIndex, col);
            if (cell && cell !== existing) {
                setColumn(cell, col);
            }
            node.appendChild(cell || existing);
        };
        visible.frozen.forEach(updateImpl);
        for (var i = visible.first; i <= visible.last; ++i) {
            updateImpl(i);
        }
    };
    ACellAdapter.prototype.syncFrozen = function (first) {
        var columns = this.context.columns;
        var visible = this.visibleColumns;
        if (!columns.some(function (d) { return d.frozen; })) {
            return 0;
        }
        if (first === 0) {
            if (visible.frozen.length > 0) {
                this.removeFrozenColumns(visible.frozen, 0);
                visible.frozen = [];
            }
            return 0;
        }
        var old = visible.frozen.length;
        var _a = updateFrozen(visible.frozen, columns, first), target = _a.target, added = _a.added, removed = _a.removed;
        if (removed.length > 0) {
            this.removeFrozenColumns(removed, old - removed.length);
        }
        if (added.length > 0) {
            this.insertFrozenColumns(added, old - removed.length);
        }
        visible.frozen = target;
        return target.length;
    };
    ACellAdapter.prototype.onScrolledHorizontallyImpl = function (scrollLeft, clientWidth) {
        var column = this.context.column;
        var _a = range(scrollLeft, clientWidth, column.defaultRowHeight, column.exceptions, column.numberOfRows), first = _a.first, last = _a.last, firstRowPos = _a.firstRowPos;
        var visible = this.visibleColumns;
        visible.forcedFirst = first;
        visible.forcedLast = last;
        if ((first - visible.first) >= 0 && (last - visible.last) <= 0) {
            return EScrollResult.NONE;
        }
        var r = EScrollResult.SOME;
        var frozenShift = this.syncFrozen(first);
        if (first > visible.last || last < visible.first) {
            this.removeAllColumns(false);
            this.addColumnAtEnd(first, last);
            r = EScrollResult.ALL;
        }
        else if (first < visible.first) {
            this.removeColumnFromEnd(last + 1, visible.last);
            this.addColumnAtStart(first, visible.first - 1, frozenShift);
            r = EScrollResult.SOME_TOP;
        }
        else {
            this.removeColumnFromStart(visible.first, first - 1, frozenShift);
            this.addColumnAtEnd(visible.last + 1, last);
            r = EScrollResult.SOME_BOTTOM;
        }
        visible.first = first;
        visible.last = last;
        this.updateColumnOffset(firstRowPos);
        return r;
    };
    return ACellAdapter;
}());
export { ACellAdapter };
export default ACellAdapter;
function verifyRow(row, index, columns) {
    var cols = Array.from(row.children);
    if (cols.length <= 1) {
        return;
    }
    var colObjs = cols.map(function (c) { return columns.find(function (d) { return d.id === c.dataset.id; }); });
    console.assert(colObjs.every(function (d) { return Boolean(d); }), 'all columns must exist', index);
    console.assert(colObjs.every(function (d, i) { return i === 0 || d.index >= colObjs[i - 1].index; }), 'all columns in ascending order', index);
    console.assert((new Set(colObjs)).size === colObjs.length, 'unique columns', colObjs);
}
//# sourceMappingURL=ACellAdapter.js.map