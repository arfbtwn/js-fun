'use strict';

var { Tree, TreeMap, TreeSet, Node } = require('./tree.js');

const root = new Node({
    left:  new Node({ key: 'a' }),
    key:   'b',
    right: new Node({ key: 'c' })
});

describe('Node', () => {
    describe('ctor', () => {
        it('is resistant', () => {
            let sut;
            expect(() => sut = Node()).not.toThrow();
            expect(() => sut = Node({ key: 1 })).not.toThrow();
            expect(sut.key)  .toBe(1);
            expect(sut.value).toBe(1);
        });
    });

    describe(Symbol.iterator.toString(), () => {
        it('returns in order', () => {
            const expected = [ [ 'a', 'a' ], [ 'b', 'b' ], [ 'c', 'c' ] ];
            let   items;

            let sut = root;

            items = [...sut];
            expect(items).toMatchObject(expected);
            items = [...sut.entries()];
            expect(items).toMatchObject(expected);
        });
    });

    describe('keys', () => {
        it('returns in order', () => {
            let sut = root;

            let items = [...sut.keys()];

            expect(items).toMatchObject([ 'a', 'b', 'c' ]);
        });
    });

    describe('values', () => {
        it('returns in order', () => {
            let sut = root;

            let items = [...sut.values()];

            expect(items).toMatchObject([ 'a', 'b', 'c' ]);
        });
    });

    describe('clone', () => {
        it('returns a deep clone', () => {
            let clone = Node.clone(root);

            expect(clone).not.toBe(root);

            expect(clone.left) .not.toBe(root.left);
            expect(clone.right).not.toBe(root.right);
        })
    });

    describe('left and right', () => {
        it('set the \'up\' property on the child', () => {
            let sut = root;

            expect(sut.left .up).toBe(sut);
            expect(sut.right.up).toBe(sut);
        });
    });

    describe('depth', () => {
        it('returns the depth of the tree', () => {
            let sut = Node;

            expect(sut.depth(root)).toBe(2);
        });
    });

    describe('level', () => {
        it('returns the level of the tree', () => {
            let sut = Node;

            expect(sut.level(root))     .toBe(1);
            expect(sut.level(root.left)).toBe(2);
        });
    });

    describe('balance', () => {
        it('results in a balanced tree', () => {
            let sut = Node;
            let root = new Node({
                key: 1,
                right: {
                    key: 2,
                    right: {
                        key: 3,
                        right: {
                            key: 4
                        }
                    }
                }
            });

            root = sut.balance(root);

            expect(root).toMatchObject({
                left: {
                    key: 1
                },
                key: 2,
                right: {
                    key: 3,
                    right: {
                        key: 4
                    }
                }
            });
        });
    });

    describe('verify', () => {
        it('returns true for a known valid tree', () => {
            let sut = Node;

            let node = {
                key: 1,
                left: { key: 0 },
                right: { key: 2 }
            };

            expect(sut.verify(node)).toBe(true);
        });

        it('returns false for a known invalid tree', () => {
            let sut = Node;

            let node = {
                key: 1,
                left: { key: 2 },
                right: { key: 0 }
            };

            expect(sut.verify(node)).toBe(false);
        });

        it('returns false for a more complex invalid case', () => {
            let sut = Node;

            let node = {
                key: 1,
                left: { key: 0 },
                right: {
                    key: 2,
                    left: { key: 0 }
                }
            };

            expect(sut.verify(node))      .toBe(false);
            expect(sut.verify(node.right)).toBe(true);
        });
    });

    describe('size', () => {
        it('returns the size of the Node', () => {
            let sut = Node;

            expect(sut.size(root)).toBe(3);
        });
    });
});

describe('Tree', () => {
    describe('add', () => {
        it('elements are ordered', () => {
            let sut = new Tree;

            sut.add('b');
            sut.add('a');
            sut.add('c');

            expect(sut).toMatchObject({
                root: {
                    left:  { value: 'a' },
                    value:  'b',
                    right: { value: 'c' }
                }
            })
        });
    });

    describe('self balancing', () => {
        let sut = new Tree;

        sut.add('a');
        sut.add('b');
        sut.add('c');

        expect(sut).toMatchObject({
            root: {
                left:  { value: 'a' },
                value:  'b',
                right: { value: 'c' }
            }
        });
    });

    describe('remove', () => {
        let sut;

        it('removes the root', () => {
            sut = new Tree;

            sut.add('b');
            sut.remove('b');

            expect(sut.root).toBeUndefined();
        });

        it('removes the target', () => {
            sut = new Tree(root.clone());

            sut.remove('a');

            expect(sut.root.left).toBeUndefined();
        });

        it('swaps elements', () => {
            sut = new Tree;

            sut.add('d');

            sut.add('b');
            sut.add('c');
            sut.add('a');

            sut.add('f');
            sut.add('e');
            sut.add('g');

            sut.remove('f');
            sut.remove('d');

            expect(sut.find('f')).toBeUndefined();
            expect(sut.find('d')).toBeUndefined();

            expect(sut.root.value)      .toBe('e');
            expect(sut.root.right.value).toBe('g');
        });
    });

    describe('keys', () => {
        it('returns in order', () => {
            let sut = new Tree(root);

            let items = [...sut.keys()];

            expect(items).toMatchObject([ 'a', 'b', 'c' ]);
        });
    });

    describe('values', () => {
        it('returns in order', () => {
            let sut = new Tree(root);

            let items = [...sut.values()];

            expect(items).toMatchObject([ 'a', 'b', 'c' ]);
        });
    });

    describe('find', () => {
        it('returns the Node of an existing element', () => {
            let sut = new Tree(root);

            let node = sut.find('a');

            expect(node).toBe(root.left);
        });

        it('returns undefined for missing elements', () => {
            let sut = new Tree;

            let node = sut.find('a');

            expect(node).toBeUndefined();
        });
    });

    describe('forEach', () => {
        it('iterates in order', () => {
            let sut = new Tree;

            sut.add(1);
            sut.add(2);
            sut.add(3);

            let actual = [];

            sut.forEach((x, y) => actual.push(x));

            expect(actual).toEqual([ 1, 2, 3 ]);
        });
    });
});

describe('TreeMap', () => {
    describe(Symbol.iterator.toString(), () => {
        it('returns pairs', () => {
            let sut = new TreeMap();

            sut.add(1);

            expect([...sut]).toEqual([ [ 1, 1 ] ]);
        });
    });
});

describe('TreeSet', () => {
    describe(Symbol.iterator.toString(), () => {
        it('returns values', () => {
            let sut = new TreeSet();

            sut.add(1);

            expect([...sut]).toEqual([ 1 ]);
        });
    });
});
