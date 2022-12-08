import * as tslib_1 from "tslib";
var AQuadTreeNode = (function () {
    function AQuadTreeNode(index, rowFirst, rowLast, colFirst, colLast, rowTotal, colTotal) {
        this.index = index;
        this.rowFirst = rowFirst;
        this.rowLast = rowLast;
        this.colFirst = colFirst;
        this.colLast = colLast;
        this.rowTotal = rowTotal;
        this.colTotal = colTotal;
        this.parent = null;
    }
    Object.defineProperty(AQuadTreeNode.prototype, "rowCount", {
        get: function () {
            return this.rowLast - this.rowFirst + 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AQuadTreeNode.prototype, "colCount", {
        get: function () {
            return this.colLast - this.colFirst + 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AQuadTreeNode.prototype, "width", {
        get: function () {
            return this.rowTotal;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AQuadTreeNode.prototype, "height", {
        get: function () {
            return this.colTotal;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AQuadTreeNode.prototype, "rowId", {
        get: function () {
            var id = this.index < 2 ? '0' : '1';
            var p = this.parent;
            while (p !== null) {
                id = "" + (p.index < 2 ? '0' : '1') + id;
                p = p.parent;
            }
            return id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AQuadTreeNode.prototype, "colId", {
        get: function () {
            var id = this.index % 2 === 0 ? '0' : '1';
            var p = this.parent;
            while (p !== null) {
                id = "" + (p.index % 2 === 0 ? '0' : '1') + id;
                p = p.parent;
            }
            return id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AQuadTreeNode.prototype, "id", {
        get: function () {
            var id = String(this.index);
            var p = this.parent;
            while (p !== null) {
                id = p.index + "-" + id;
                p = p.parent;
            }
            return id;
        },
        enumerable: true,
        configurable: true
    });
    return AQuadTreeNode;
}());
var QuadTreeLeafNode = (function (_super) {
    tslib_1.__extends(QuadTreeLeafNode, _super);
    function QuadTreeLeafNode() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'leaf';
        return _this;
    }
    return QuadTreeLeafNode;
}(AQuadTreeNode));
export { QuadTreeLeafNode };
export var TOP_LEFT = 0;
export var TOP_RIGHT = 1;
export var BOTTOM_LEFT = 2;
export var BOTTOM_RIGHT = 3;
var QuadTreeInnerNode = (function (_super) {
    tslib_1.__extends(QuadTreeInnerNode, _super);
    function QuadTreeInnerNode() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'inner';
        _this.children = [];
        return _this;
    }
    Object.defineProperty(QuadTreeInnerNode.prototype, "colMiddle", {
        get: function () {
            return Math.floor(this.colFirst + this.colCount / 2) - 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(QuadTreeInnerNode.prototype, "rowMiddle", {
        get: function () {
            return Math.floor(this.rowFirst + this.rowCount / 2) - 1;
        },
        enumerable: true,
        configurable: true
    });
    return QuadTreeInnerNode;
}(AQuadTreeNode));
export { QuadTreeInnerNode };
//# sourceMappingURL=QuadTreeNode.js.map