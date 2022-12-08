import { GridStyleManager } from '../style/index';
import { addScroll, defaultMode } from '../internal';
var MultiTableRowRenderer = (function () {
    function MultiTableRowRenderer(node, htmlId, options) {
        if (options === void 0) { options = {}; }
        var _this = this;
        this.node = node;
        this.tableId = 0;
        this.sections = [];
        this.options = {
            columnPadding: 0,
            async: defaultMode,
            minScrollDelta: 30
        };
        Object.assign(this.options, options);
        node.id = htmlId.startsWith('#') ? htmlId.slice(1) : htmlId;
        node.innerHTML = "<header><footer>&nbsp;</footer></header><main><footer>&nbsp;</footer></main>";
        node.classList.add('lineup-engine', 'lineup-multi-engine');
        this.style = new GridStyleManager(this.node, htmlId);
        var old = addScroll(this.main, this.options.async, function (act) {
            if (Math.abs(old.left - act.left) < _this.options.minScrollDelta && Math.abs(old.width - act.width) < _this.options.minScrollDelta) {
                return;
            }
            var isGoingRight = act.left > old.left;
            old = act;
            _this.onScrolledHorizontally(act.left, act.width, isGoingRight);
        });
    }
    MultiTableRowRenderer.prototype.update = function () {
        var _this = this;
        this.onScrolledHorizontally(this.main.scrollLeft, this.main.clientWidth, false);
        var offset = 0;
        this.sections.forEach(function (s) {
            s.body.style.left = s.header.style.left = offset + "px";
            offset += s.width + _this.options.columnPadding;
        });
    };
    MultiTableRowRenderer.prototype.onScrolledHorizontally = function (scrollLeft, clientWidth, isGoingRight) {
        var _this = this;
        var offset = 0;
        var scrollEnd = scrollLeft + clientWidth;
        this.sections.forEach(function (s) {
            var end = offset + s.width;
            if (end < scrollLeft || offset > scrollEnd) {
                s.hide();
            }
            else {
                s.show(Math.max(0, scrollLeft - offset), Math.min(scrollEnd - offset, s.width), isGoingRight);
            }
            offset = end + _this.options.columnPadding;
        });
        this.updateOffset();
    };
    MultiTableRowRenderer.prototype.updateOffset = function () {
        var _this = this;
        var headerFooter = this.header.querySelector('footer');
        var bodyFooter = this.main.querySelector('footer');
        var maxHeight = Math.max.apply(Math, [0].concat(this.sections.map(function (d) { return d.height; })));
        var total = this.sections.reduce(function (a, c) { return a + c.width + _this.options.columnPadding; }, 0);
        headerFooter.style.transform = "translate(" + total + "px,0)";
        bodyFooter.style.transform = "translate(" + total + "px, " + maxHeight + "px)";
    };
    MultiTableRowRenderer.prototype.destroy = function () {
        this.sections.forEach(function (d) { return d.destroy(); });
        this.node.remove();
    };
    Object.defineProperty(MultiTableRowRenderer.prototype, "doc", {
        get: function () {
            return this.node.ownerDocument;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MultiTableRowRenderer.prototype, "header", {
        get: function () {
            return this.node.querySelector('header');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MultiTableRowRenderer.prototype, "main", {
        get: function () {
            return this.node.querySelector('main');
        },
        enumerable: true,
        configurable: true
    });
    MultiTableRowRenderer.prototype.pushTable = function (factory) {
        var extras = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            extras[_i - 1] = arguments[_i];
        }
        var header = this.doc.createElement('article');
        var body = this.doc.createElement('article');
        var tableId = "T" + this.tableId++;
        var ids = this.style.tableIds(tableId);
        header.id = ids.header;
        body.id = ids.body;
        this.header.insertBefore(header, this.header.lastElementChild);
        this.main.appendChild(body);
        var table = factory.apply(void 0, [header, body, tableId, this.style].concat(extras));
        table.init();
        this.sections.push(table);
        this.update();
        return table;
    };
    MultiTableRowRenderer.prototype.pushSeparator = function (factory) {
        var extras = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            extras[_i - 1] = arguments[_i];
        }
        var header = this.doc.createElement('section');
        var body = this.doc.createElement('section');
        this.header.insertBefore(header, this.header.lastElementChild);
        this.main.appendChild(body);
        var separator = factory.apply(void 0, [header, body, this.style].concat(extras));
        separator.init();
        this.sections.push(separator);
        this.update();
        return separator;
    };
    MultiTableRowRenderer.prototype.remove = function (section) {
        var index = this.sections.indexOf(section);
        if (index < 0) {
            return false;
        }
        this.sections.splice(index, 1);
        section.destroy();
        this.update();
        return true;
    };
    MultiTableRowRenderer.prototype.clear = function () {
        this.sections.splice(0, this.sections.length).forEach(function (s) { return s.destroy(); });
        this.update();
    };
    MultiTableRowRenderer.prototype.widthChanged = function () {
        this.update();
    };
    return MultiTableRowRenderer;
}());
export default MultiTableRowRenderer;
//# sourceMappingURL=MultiTableRowRenderer.js.map