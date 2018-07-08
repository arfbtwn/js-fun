'use strict';

var { Node } = require('./node.js');

function _lt (x, y) { return x < y; }

function Tree (root, less = _lt) {
    if (!new.target) return new Tree(...arguments);

    this.root = root;
    this.less = less;
}

Object.defineProperties(Tree.prototype, {
    size: {
        get: function () { return Node.size(this.root); }
    }
});

const _i_ = Symbol.iterator, _s_ = Symbol.toStringTag;

Object.assign(Tree.prototype, {
    [_s_]:   'Tree',
    [_i_]:   function* () { yield* Node.entries(this.root); },
    keys:    function* () { yield* Node.keys   (this.root); },
    values:  function* () { yield* Node.values (this.root); },
    entries: function* () { yield* Node.entries(this.root); },

    find: function (key) { return Node.find(this.root, key); },

    add: function (key, value = key) {
        this.root = Node.balance(
            Node.add(undefined, this.root, key, value, this.less, false)
        );

        return this;
    },

    remove: function (key) {
        const node = Node.find(this.root, key);
        const root = Node.remove(node);

        if (this.root === node) {
            this.root = root;
        }

        return !!node;
    },

    clear: function () { this.root = undefined; },

    forEach: function (cb, _this) {
        for (let [ key, value ] of this) {
            cb.apply(_this, [ value, key, this ]);
        }
    }
});

Object.assign(Tree.prototype, {
    length: 0,
    has: function (key) {
        return !!Node.find(this.root, key);
    },
    get: function (key) {
        const node = Node.find(this.root, key);

        return node ? node.data : undefined;
    },
    set: function (key, value = key) {
        this.root = Node.balance(
            Node.add(undefined, this.root, key, value, this.less, true)
        );

        return this;
    },
    delete: Tree.prototype.remove
});

function TreeMap () {
    if (!new.target) return new TreeMap(...arguments);

    Tree.apply(this, arguments);
}

TreeMap.prototype = Object.assign(Object.create(Tree.prototype), {
    constructor: TreeMap,

    [_s_]: 'TreeMap'
});

function TreeSet () {
    if (!new.target) return new TreeSet(...arguments);

    Tree.apply(this, arguments);
}

TreeSet.prototype = Object.assign(Object.create(Tree.prototype), {
    constructor: TreeSet,

    [_s_]: 'TreeSet',
    [_i_]: function* () { yield* Node.values(this.root); },

    delete: function (key) {
        Tree.prototype.remove.call(this, [ key ]);

        return key;
    }
});

module.exports = { Tree, TreeMap, TreeSet, Node };
