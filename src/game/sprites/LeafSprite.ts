import { Leaf } from 'src/physics/collisions/quad-tree/QuadTree';

export class LeafSprite {
    constructor(private leaf: Leaf, public element: HTMLElement) {}

    get id(): string {
        return this.leaf.id;
    }

    update(): void {
        const { x0: left, y0: top } = this.leaf.rect;

        this.element.style.left = `${left}px`;
        this.element.style.top = `${top}px`;

        this.element.style.width = `${this.leaf.width}px`;
        this.element.style.height = `${this.leaf.height}px`;
        this.element.innerText = `${this.leaf.bodies.length}`;
    }
}
