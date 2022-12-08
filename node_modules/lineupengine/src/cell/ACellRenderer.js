import { range } from '../logic';
import { BOTTOM_LEFT, BOTTOM_RIGHT, QuadTreeInnerNode, QuadTreeLeafNode, TOP_LEFT, TOP_RIGHT } from './internal/QuadTreeNode';
var template = "<header></header>\n<aside></aside>\n<main><div></div></main><style></style>";
var leafCount = 4;
var ACellRenderer = (function () {
    function ACellRenderer(root) {
        this.root = root;
        this.poolLeaves = [];
        this.poolInner = [];
        this.tree = null;
        root.innerHTML = template;
        root.classList.add('lineup-cell-engine');
    }
    Object.defineProperty(ACellRenderer.prototype, "doc", {
        get: function () {
            return this.root.ownerDocument;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ACellRenderer.prototype, "body", {
        get: function () {
            return this.root.children[2];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ACellRenderer.prototype, "colHeader", {
        get: function () {
            return this.root.firstElementChild;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ACellRenderer.prototype, "rowHeader", {
        get: function () {
            return this.root.children[1];
        },
        enumerable: true,
        configurable: true
    });
    ACellRenderer.prototype.init = function () {
        var _this = this;
        var body = this.body;
        var rowHeader = this.rowHeader;
        var colHeader = this.colHeader;
        var oldTop = body.scrollTop;
        var oldLeft = body.scrollLeft;
        body.addEventListener('scroll', function () {
            var left = body.scrollLeft;
            var top = body.scrollTop;
            if (oldTop === top && oldLeft === left) {
                return;
            }
            var isGoingDown = top > oldTop;
            var isGoingRight = left > oldLeft;
            oldTop = top;
            oldLeft = left;
            rowHeader.scrollTop = top;
            colHeader.scrollLeft = left;
            _this.onScroll(left, top, body.clientWidth, body.clientHeight, isGoingDown, isGoingRight);
        });
        this.recreate();
    };
    ACellRenderer.sliceHeight = function (ctx, start, end) {
        var height = (end - start + 1) * ctx.defaultRowHeight;
        for (var _i = 0, _a = ctx.exceptions; _i < _a.length; _i++) {
            var ex = _a[_i];
            if (ex.index < start) {
                continue;
            }
            if (ex.index > end) {
                break;
            }
            height += ex.height - ctx.defaultRowHeight;
        }
        return height;
    };
    ACellRenderer.prototype.buildTree = function (row, col) {
        var build = function (index, rowFirst, rowLast, colFirst, colLast, rowTotal, colTotal) {
            var rowCount = rowLast - rowFirst + 1;
            var colCount = colLast - colFirst + 1;
            if (rowCount <= leafCount && colCount <= leafCount) {
                return new QuadTreeLeafNode(index, rowFirst, rowLast, colFirst, colLast, rowTotal, colTotal);
            }
            var inner = new QuadTreeInnerNode(index, rowFirst, rowLast, colFirst, colLast, rowTotal, colTotal);
            var leftSlice = ACellRenderer.sliceHeight(col, colFirst, inner.colMiddle);
            var rightSlice = colTotal - leftSlice;
            var topSlice = ACellRenderer.sliceHeight(row, rowFirst, inner.rowMiddle);
            var bottomSlice = rowTotal - topSlice;
            inner.children.push(build(TOP_LEFT, rowFirst, inner.rowMiddle, colFirst, inner.colMiddle, topSlice, leftSlice));
            inner.children.push(build(TOP_RIGHT, rowFirst, inner.rowMiddle, inner.colMiddle + 1, colLast, topSlice, rightSlice));
            inner.children.push(build(BOTTOM_LEFT, inner.rowMiddle + 1, rowLast, colFirst, inner.colMiddle, bottomSlice, leftSlice));
            inner.children.push(build(BOTTOM_RIGHT, inner.rowMiddle + 1, rowLast, inner.colMiddle + 1, colLast, bottomSlice, rightSlice));
            inner.children.forEach(function (c) { return c.parent = inner; });
            return inner;
        };
        return build(0, 0, row.numberOfRows - 1, 0, col.numberOfRows - 1, row.totalHeight, col.totalHeight);
    };
    ACellRenderer.prototype.recreate = function () {
        var _this = this;
        var context = this.context;
        var body = this.body;
        this.tree = this.buildTree(context.row, context.col);
        var root = body.firstElementChild;
        Array.from(root.children).forEach(function (c) { return _this.recycle(c); });
        this.clearPool();
        var col = range(body.scrollLeft, body.clientWidth, context.col.defaultRowHeight, context.col.exceptions, context.col.numberOfRows);
        var row = range(body.scrollTop, body.clientHeight, context.row.defaultRowHeight, context.row.exceptions, context.row.numberOfRows);
        root.dataset.node = this.tree.type;
        root.dataset.id = this.tree.id;
        root.style.width = this.tree.width + "px";
        root.style.height = this.tree.height + "px";
        this.render(this.tree, root, row.first, row.last, col.first, col.last);
    };
    ACellRenderer.prototype.onScroll = function (left, top, width, height, _isGoingDown, _isGoingRight) {
        var context = this.context;
        var col = range(left, width, context.col.defaultRowHeight, context.col.exceptions, context.col.numberOfRows);
        var row = range(top, height, context.row.defaultRowHeight, context.row.exceptions, context.row.numberOfRows);
        var root = this.body.firstElementChild;
        this.render(this.tree, root, row.first, row.last, col.first, col.last);
    };
    ACellRenderer.prototype.renderLeaf = function (leaf, parent) {
        var doc = this.doc;
        var children = Array.from(parent.children);
        parent.dataset.leafCols = String(leaf.colCount);
        if (children.length > 0) {
            parent.innerHTML = '';
        }
        for (var row = leaf.rowFirst; row <= leaf.rowLast; ++row) {
            for (var col = leaf.colFirst; col <= leaf.colLast; ++col) {
                var item = void 0;
                if (children.length > 0) {
                    item = children.shift();
                    var change = this.updateCell(item, row, col);
                    if (change && change !== item) {
                        children.unshift(item);
                        item = change;
                    }
                }
                else {
                    item = this.createCell(doc, row, col);
                }
                item.dataset.row = String(row);
                item.dataset.col = String(col);
                parent.appendChild(item);
            }
            parent.appendChild(doc.createElement('br'));
        }
        return parent;
    };
    ACellRenderer.prototype.render = function (node, parent, rowFirst, rowLast, colFirst, colLast) {
        var _this = this;
        if (node.type === 'leaf') {
            return this.renderLeaf(node, parent);
        }
        var inner = node;
        var create = function (index) {
            var child = inner.children[index];
            var node;
            if (child.type === 'inner') {
                node = _this.poolInner.length > 0 ? _this.poolInner.pop() : _this.doc.createElement('div');
            }
            else {
                node = _this.poolLeaves.length > 0 ? _this.poolLeaves.pop() : _this.doc.createElement('div');
            }
            node.dataset.node = child.type;
            node.dataset.id = child.id;
            return _this.render(child, node, rowFirst, rowLast, colFirst, colLast);
        };
        var placeholder = function (index) {
            var child = inner.children[index];
            var node = _this.poolInner.length > 0 ? _this.poolInner.pop() : _this.doc.createElement('div');
            node.dataset.node = 'placeholder';
            node.dataset.id = child.id;
            node.style.width = child.width + "px";
            node.style.height = child.height + "px";
            return node;
        };
        var children = Array.from(parent.children);
        var showLeft = !(inner.colFirst > colLast || inner.colMiddle < colFirst);
        var showRight = !(inner.colMiddle > colLast || inner.colLast < colFirst);
        var showTop = !(inner.rowFirst > rowLast || inner.rowMiddle < rowFirst);
        var showBottom = !(inner.rowMiddle > rowLast || inner.rowLast < rowFirst);
        if (children.length === 0) {
            parent.appendChild(showLeft && showTop ? create(TOP_LEFT) : placeholder(TOP_LEFT));
            parent.appendChild(showRight && showTop ? create(TOP_RIGHT) : placeholder(TOP_RIGHT));
            parent.appendChild(this.doc.createElement('br'));
            parent.appendChild(showLeft && showBottom ? create(BOTTOM_LEFT) : placeholder(BOTTOM_LEFT));
            parent.appendChild(showRight && showBottom ? create(BOTTOM_RIGHT) : placeholder(BOTTOM_RIGHT));
            return parent;
        }
        {
            var node_1 = children[TOP_LEFT];
            var down = showLeft && showTop;
            if (down !== (node_1.dataset.node !== 'placeholder')) {
                parent.replaceChild(down ? create(TOP_LEFT) : placeholder(TOP_LEFT), node_1);
                this.recycle(node_1);
            }
            else if (down && inner.children[TOP_LEFT].type === 'inner') {
                this.render(inner.children[TOP_LEFT], node_1, rowFirst, rowLast, colFirst, colLast);
            }
        }
        {
            var node_2 = children[TOP_RIGHT];
            var down = showRight && showTop;
            if (down !== (node_2.dataset.node !== 'placeholder')) {
                parent.replaceChild(down ? create(TOP_RIGHT) : placeholder(TOP_RIGHT), node_2);
                this.recycle(node_2);
            }
            else if (down && inner.children[TOP_RIGHT].type === 'inner') {
                this.render(inner.children[TOP_RIGHT], node_2, rowFirst, rowLast, colFirst, colLast);
            }
        }
        {
            var node_3 = children[BOTTOM_LEFT + 1];
            var down = showLeft && showBottom;
            if (down !== (node_3.dataset.node !== 'placeholder')) {
                parent.replaceChild(down ? create(BOTTOM_LEFT) : placeholder(BOTTOM_LEFT), node_3);
                this.recycle(node_3);
            }
            else if (down && inner.children[BOTTOM_LEFT].type === 'inner') {
                this.render(inner.children[BOTTOM_LEFT], node_3, rowFirst, rowLast, colFirst, colLast);
            }
        }
        {
            var node_4 = children[BOTTOM_RIGHT + 1];
            var down = showRight && showBottom;
            if (down !== (node_4.dataset.node !== 'placeholder')) {
                parent.replaceChild(down ? create(BOTTOM_RIGHT) : placeholder(BOTTOM_RIGHT), node_4);
                this.recycle(node_4);
            }
            else if (down && inner.children[BOTTOM_RIGHT].type === 'inner') {
                this.render(inner.children[BOTTOM_RIGHT], node_4, rowFirst, rowLast, colFirst, colLast);
            }
        }
        return parent;
    };
    ACellRenderer.prototype.recycle = function (node) {
        var _this = this;
        if (node.dataset.node === 'leaf') {
            this.recycleLeaf(node);
            return;
        }
        var leaves = Array.from(node.querySelectorAll('[data-node=leaf]'));
        var inner = Array.from(node.querySelectorAll('[data-node=inner], [data-node=placeholder'));
        node.innerHTML = '';
        leaves.forEach(function (node) { return _this.recycleLeaf(node); });
        inner.forEach(function (node) {
            node.innerHTML = '';
            _this.poolInner.push(ACellRenderer.cleanUp(node));
        });
        this.poolInner.push(ACellRenderer.cleanUp(node));
    };
    ACellRenderer.cleanUp = function (node) {
        if (node.style.width) {
            node.style.width = null;
        }
        if (node.style.height) {
            node.style.height = null;
        }
        return node;
    };
    ACellRenderer.prototype.recycleLeaf = function (node) {
        this.poolLeaves.push(ACellRenderer.cleanUp(node));
    };
    ACellRenderer.prototype.clearPool = function () {
        this.poolInner.splice(0, this.poolInner.length);
        this.poolLeaves.splice(0, this.poolLeaves.length);
    };
    return ACellRenderer;
}());
export { ACellRenderer };
export default ACellRenderer;
//# sourceMappingURL=ACellRenderer.js.map