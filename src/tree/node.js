'use strict';

function _lt (x, y) { return x < y; }

function _id (x) { return x; }

function* iter (node) {
    if (!node) return;

    yield* iter(node.left);
    yield  node;
    yield* iter(node.right);
}

function* keys (node) {
    for (let { key } of iter(node)) {
        yield key;
    }
}

function* values (node) {
    for (let { value } of iter(node)) {
        yield value;
    }
}

function* entries (node) {
    for (let { key, value } of iter(node)) {
        yield [ key, value ];
    }
}

function min  (node = {}) { return node.left  ? min (node.left)  : node; }
function max  (node = {}) { return node.right ? max (node.right) : node; }
function root (node = {}) { return node.up    ? root(node.up)    : node; }

function level (node) { return node ? 1 + level(node.up) : 0; }
function depth (node) {
    if (!node) return 0;

    let l = depth(node.left);
    let r = depth(node.right);

    return 1 + Math.max(l, r);
}

function size (node) {
    if (!node) return 0;

    return size(node.left)
         + 1
         + size(node.right);
}

function find (node, key) {
    if (!node) return;

    const { less = _lt } = node;

    if (less(key, node.key)) return find(node.left,  key);
    if (less(node.key, key)) return find(node.right, key);

    return node;
}

function add (up, node, key, value, less = _lt, replace = false) {
    if (!node) {
        node = new Node({ up, key, value, less });
    } else if (less(key, node.key)) {
        node.left  = add(node, node.left,  key, value, node.less, replace);
    } else if (less(node.key, key)) {
        node.right = add(node, node.right, key, value, node.less, replace);
    } else if (replace) {
        node.key   = key;
        node.value = value;
    }

    return node;
}

function remove (node) {
    if (!node) return;

    if (node.left && node.right) {
        let x = min(node.right);
        node.key   = x.key;
        node.value = x.value;
        replace(x);
        return node;
    } else if (node.left) {
        return replace(node, node.left);
    } else if (node.right) {
        return replace(node, node.right);
    } else {
        return replace(node);
    }
}

function replace (node, value) {
    if (node.up) {
        if (node == node.up.left)  node.up.left  = value;
        if (node == node.up.right) node.up.right = value;
    }

    if (value) value.up = node.up;

    return value;
}

function verify (node, min, max) {
    if (!node) return true;

    const { key, left, right, less = _lt } = node;

    if (less(key, min)) return false;
    if (less(max, key)) return false;

    return verify(left,  min, key)
        && verify(right, key, max);
}

function balance (node) {
    if (!node) return node;

    const l = depth(node.left);
    const r = depth(node.right);

    const f = l - r;

    if (1 < f) {
        node = rotate_right(node);
    }

    if (f < -1) {
        node = rotate_left(node);
    }

    node.left  = balance(node.left);
    node.right = balance(node.right);

    return node;
}

function rotate_left (node) {
    const o = node;
    const n = o.right;

    o.right = n.left;
    n.left  = o;
    o.up    = n;
    n.up    = o.up;

    return n;
}

function rotate_right (node) {
    const o = node;
    const n = o.left;

    o.left  = n.right;
    n.right = o;
    o.up    = n;
    n.up    = o.up;

    return n;
}

function clone (node) {
    if (!node) return;

    return node.constructor({
        left:  clone(node.left),
        less:  node.less,
        key:   node.key,
        value: node.value,
        right: clone(node.right)
    });
}

Object.assign(Node, {
    clone,
    iter,
    keys,
    values,
    entries,
    min,
    max,
    root,
    level,
    depth,
    size,
    find,
    add,
    remove,
    verify,
    balance
});

function Node ({ up, left, right, key, value = key, less = _lt } = {}) {
    if (!new.target) return new Node(...arguments);

    this.up    = up;
    this.left  = left;
    this.right = right;
    this.key   = key;
    this.value = value;
    this.less  = less;
}

function leg (node, side, child) {
    node[side] = child;

    if (child) child.up = node;
}

const L = Symbol('left'), R = Symbol('right');

Object.defineProperties(Node.prototype, {
    left: {
        get: function ( ) { return this[L];  },
        set: function (x) { leg(this, L, x); }
    },
    right: {
        get: function ( ) { return this[R];  },
        set: function (x) { leg(this, R, x); }
    },
    level: {
        get: function () { return Node.level(this); }
    },
    depth: {
        get: function () { return Node.depth(this); }
    },
    size: {
        get: function () { return Node.size(this); }
    }
});

const _s_ = Symbol.toStringTag, _i_ = Symbol.iterator;

Object.assign(Node.prototype, {
    [_s_]:   'Node',
    [_i_]:   function* () { yield* Node.entries(this); },

    clone:   function  () { return Node.clone  (this); },
    min:     function  () { return Node.min    (this); },
    max:     function  () { return Node.max    (this); },
    root:    function  () { return Node.root   (this); },

    keys:    function* () { yield* Node.keys   (this); },
    values:  function* () { yield* Node.values (this); },
    entries: function* () { yield* Node.entries(this); },

    find: function (key) {
        return Node.find(this, key);
    },

    add: function (key, value) {
        return Node.add(this.up, this, key, value, this.less);
    },

    remove: function (key) {
        const node = Node.find(this, key);
        const root = Node.remove(node);

        return this === node ? root : this;
    }
});

module.exports = { Node };
