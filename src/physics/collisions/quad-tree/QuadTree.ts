import { v4 as uuid } from 'uuid';
import { Body, Dimensions, Shape } from '../../bodies/types';
import { Rect } from 'src/physics/bodies/shapes/Rect';
import { intersects } from '../collision-detection/collision-detection';
import { CircleBody } from 'src/physics/bodies/CircleBody';
import { RectBody } from 'src/physics/bodies/RectBody';
import { ErrorMessage } from 'src/physics/constants';

type QuadTreeArgs = Dimensions & {
    options?: QuadTreeOptions;
};

type UniqueBodiesInNode = {
    uniqueBodies: Body[];
    bodyIdSet: Set<string>;
};

export type QuadTreeOptions = {
    maxBodiesInLeaf?: number;
    minLeafDimensions?: Dimensions;
};

const DEFAULT_QUAD_TREE_OPTIONS: Required<QuadTreeOptions> = {
    maxBodiesInLeaf: 2,
    minLeafDimensions: {
        width: 24,
        height: 24,
    },
};

abstract class Node {
    public id = uuid();

    constructor(public rect: Rect, protected options: Required<QuadTreeOptions>) {}

    get width(): number {
        return this.rect.width;
    }

    get height(): number {
        return this.rect.height;
    }

    abstract get bodies(): Body[];

    abstract addBody(body: Body): void;
    abstract removeBody(body: Body): void;
    abstract getBodiesOverlappingShape(shape: Shape): Body[];
}

export class Leaf extends Node {
    public bodies: Body[] = [];

    constructor(public rect: Rect, options: Required<QuadTreeOptions>) {
        super(rect, options);
    }

    addBody(body: Body): void {
        this.bodies.push(body);
    }

    removeBody(body: Body): void {
        this.bodies = this.bodies.filter((b) => b.id !== body.id);
    }

    getBodiesOverlappingShape(shape: Shape): Body[] {
        return this.bodies.filter((b) => intersects(shape, b.shape));
    }

    exceedsBodyLimit(): boolean {
        return this.bodies.length > this.options.maxBodiesInLeaf;
    }

    canPartition(): boolean {
        const { width: minWidth, height: minHeight } = this.options.minLeafDimensions;
        return this.width / 2 >= minWidth && this.height / 2 >= minHeight;
    }

    partitionIntoInnerNode(): InnerNode {
        const innerNode = new InnerNode(this.rect, this.options);

        for (const body of this.bodies) {
            innerNode.addBody(body);
        }

        return innerNode;
    }
}

class InnerNode extends Node {
    private children: (InnerNode | Leaf)[];

    constructor(public rect: Rect, options: Required<QuadTreeOptions>) {
        super(rect, options);
        this.children = this.getChildren();
    }

    get leaves(): Leaf[] {
        return this.children.reduce<Leaf[]>((acc, child) => {
            return child instanceof Leaf ? [...acc, child] : [...acc, ...child.leaves];
        }, []);
    }

    get bodies(): Body[] {
        const allBodies = this.children.reduce<Body[]>((acc, child) => [...acc, ...child.bodies], []);

        const { uniqueBodies } = allBodies.reduce<UniqueBodiesInNode>(
            (acc, body) => {
                if (!acc.bodyIdSet.has(body.id)) {
                    acc.uniqueBodies.push(body);
                    acc.bodyIdSet.add(body.id);
                }
                return acc;
            },
            {
                uniqueBodies: [],
                bodyIdSet: new Set(),
            },
        );

        return uniqueBodies;
    }

    addBody(body: Body): void {
        for (const child of this.children) {
            if (intersects(child.rect, body.shape, true)) {
                child.addBody(body);
            }
        }
    }

    removeBody(body: Body): void {
        for (const child of this.children) {
            child.removeBody(body);
        }
    }

    getBodiesOverlappingShape(shape: Shape): Body[] {
        return this.children.reduce<Body[]>((acc, child) => {
            if (intersects(child.rect, shape, true)) {
                return [...acc, ...child.getBodiesOverlappingShape(shape)];
            }
            return acc;
        }, []);
    }

    update(): void {
        this.children = this.children.map((child) => {
            if (child instanceof Leaf) {
                if (child.exceedsBodyLimit() && child.canPartition()) {
                    return child.partitionIntoInnerNode();
                }
            } else if (child instanceof InnerNode) {
                if (child.shouldCollapse()) {
                    return child.collapseIntoLeaf();
                }

                child.update();
            }
            return child;
        });
    }

    shouldCollapse(): boolean {
        return this.bodies.length <= this.options.maxBodiesInLeaf;
    }

    collapseIntoLeaf(): Leaf {
        const leaf = new Leaf(this.rect, this.options);

        for (const body of this.bodies) {
            leaf.addBody(body);
        }

        return leaf;
    }

    private getChildren(): Leaf[] {
        const { x0, y0, width, height } = this.rect;

        const childWidth = width / 2;
        const childHeight = height / 2;

        const childDimensions = {
            width: childWidth,
            height: childHeight,
        };

        const childRects = [
            // top left
            new Rect({
                x0,
                y0,
                ...childDimensions,
            }),
            // top right
            new Rect({
                x0: x0 + childWidth,
                y0,
                ...childDimensions,
            }),
            // bottom left
            new Rect({
                x0,
                y0: y0 + childHeight,
                ...childDimensions,
            }),
            // bottom right
            new Rect({
                x0: x0 + childWidth,
                y0: y0 + childHeight,
                ...childDimensions,
            }),
        ];

        return childRects.map((rect) => new Leaf(rect, this.options));
    }
}

export class QuadTree extends InnerNode {
    private bodiesInTree: Body[] = [];
    private bodySpatialMap: Record<string, string> = {};

    constructor({ width, height, options = {} }: QuadTreeArgs) {
        super(new Rect({ width, height }), { ...DEFAULT_QUAD_TREE_OPTIONS, ...options });
    }

    static getMovementBoundingBox(body: Body): Rect | null {
        if (!body.isMoving()) return null;

        const { x0, y0, x1, y1, velocity } = body;

        const bounds = {
            x0: x0 + (velocity.x < 0 ? velocity.x : 0),
            x1: x1 + (velocity.x > 0 ? velocity.x : 0),
            y0: y0 + (velocity.y < 0 ? velocity.y : 0),
            y1: y1 + (velocity.y > 0 ? velocity.y : 0),
        };

        const width = bounds.x1 - bounds.x0;
        const height = bounds.y1 - bounds.y0;

        return new Rect({
            x0: bounds.x0,
            y0: bounds.y0,
            width,
            height,
        });
    }

    private static getSpatialHash(body: Body): string {
        const { x, y } = body;

        if (body instanceof CircleBody) {
            return `${x}-${y}-${body.radius}`;
        }

        if (body instanceof RectBody) {
            return `${x}-${y}-${body.width}-${body.height}`;
        }

        throw new Error(ErrorMessage.unexpectedBodyType);
    }

    addBody(body: Body): void {
        if (this.bodySpatialMap[body.id]) {
            throw new Error(`body with id ${body.id} already exists in QuadTree`);
        }

        super.addBody(body);

        this.bodiesInTree.push(body);
        this.bodySpatialMap[body.id] = QuadTree.getSpatialHash(body);
    }

    removeBody(body: Body): void {
        super.removeBody(body);

        this.bodiesInTree = this.bodiesInTree.filter((b) => b.id !== body.id);
        delete this.bodySpatialMap[body.id];
    }

    update(): void {
        this.updateBodies();
        super.update();
    }

    private updateBodies(): void {
        for (const body of this.bodiesInTree) {
            const currentSpatialHash = QuadTree.getSpatialHash(body);
            const existingSpatialHash = this.bodySpatialMap[body.id];

            if (currentSpatialHash !== existingSpatialHash) {
                this.removeBody(body);
                this.addBody(body);
            }
        }
    }
}
