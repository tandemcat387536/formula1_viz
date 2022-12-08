var StyleManager = (function () {
    function StyleManager(root) {
        this.rules = new Map();
        this.node = root.ownerDocument.createElement('style');
        root.appendChild(this.node);
    }
    StyleManager.prototype.destroy = function () {
        this.node.remove();
    };
    StyleManager.prototype.updateRules = function () {
        this.node.innerHTML = Array.from(this.rules.values()).join('\n');
    };
    StyleManager.prototype.addRule = function (id, rule, update) {
        if (update === void 0) { update = true; }
        this.rules.set(id, rule);
        if (update) {
            this.updateRules();
        }
        return id;
    };
    StyleManager.prototype.updateRule = function (id, rule, update) {
        if (update === void 0) { update = true; }
        this.rules.set(id, rule);
        if (update) {
            this.updateRules();
        }
        return id;
    };
    StyleManager.prototype.deleteRule = function (id, update) {
        if (update === void 0) { update = true; }
        var r = this.rules.get(id);
        if (!r) {
            return;
        }
        if (update) {
            this.updateRules();
        }
    };
    Object.defineProperty(StyleManager.prototype, "ruleNames", {
        get: function () {
            return Array.from(this.rules.keys());
        },
        enumerable: true,
        configurable: true
    });
    return StyleManager;
}());
export default StyleManager;
//# sourceMappingURL=StyleManager.js.map