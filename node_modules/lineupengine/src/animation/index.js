export { default as KeyFinder } from './KeyFinder';
export var EAnimationMode;
(function (EAnimationMode) {
    EAnimationMode[EAnimationMode["UPDATE"] = 0] = "UPDATE";
    EAnimationMode[EAnimationMode["UPDATE_CREATE"] = 1] = "UPDATE_CREATE";
    EAnimationMode[EAnimationMode["UPDATE_REMOVE"] = 2] = "UPDATE_REMOVE";
    EAnimationMode[EAnimationMode["SHOW"] = 3] = "SHOW";
    EAnimationMode[EAnimationMode["HIDE"] = 4] = "HIDE";
})(EAnimationMode || (EAnimationMode = {}));
var NO_CHANGE_DELTA = 1;
export function noAnimationChange(_a, previousHeight, currentHeight) {
    var previous = _a.previous, mode = _a.mode, nodeY = _a.nodeY, current = _a.current;
    var prev = previous.height == null ? previousHeight : previous.height;
    var curr = current.height == null ? currentHeight : current.height;
    return mode === EAnimationMode.UPDATE && (Math.abs(previous.y - nodeY) <= NO_CHANGE_DELTA) && (Math.abs(prev - curr) <= NO_CHANGE_DELTA);
}
var MAX_ANIMATION_TIME = 1100;
export var defaultPhases = [
    {
        delay: 0,
        apply: function (_a) {
            var mode = _a.mode, previous = _a.previous, nodeY = _a.nodeY, current = _a.current, node = _a.node;
            node.dataset.animation = EAnimationMode[mode].toLowerCase();
            node.style.transform = "translate(0, " + (previous.y - nodeY) + "px)";
            if (mode === EAnimationMode.SHOW) {
                node.style.height = current.height !== null ? current.height + "px" : null;
            }
            else {
                node.style.height = previous.height + "px";
            }
            node.style.opacity = mode === EAnimationMode.SHOW ? '0' : (mode === EAnimationMode.HIDE ? '1' : null);
        }
    },
    {
        delay: 10,
        apply: function (_a) {
            var mode = _a.mode, current = _a.current, nodeY = _a.nodeY, node = _a.node;
            node.style.transform = (mode === EAnimationMode.HIDE || mode === EAnimationMode.UPDATE_REMOVE) ? "translate(0, " + (current.y - nodeY) + "px)" : null;
            if (mode !== EAnimationMode.HIDE) {
                node.style.height = current.height !== null ? current.height + "px" : null;
            }
            node.style.opacity = mode === EAnimationMode.SHOW ? '1' : (mode === EAnimationMode.HIDE ? '0' : null);
        }
    },
    {
        delay: MAX_ANIMATION_TIME,
        apply: function (_a) {
            var node = _a.node;
            delete node.dataset.animation;
            node.style.opacity = null;
            node.style.transform = null;
        }
    }
];
//# sourceMappingURL=index.js.map