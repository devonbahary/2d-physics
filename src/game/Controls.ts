import { Circle } from 'src/physics/bodies/shapes/Circle';
import { Rect } from 'src/physics/bodies/shapes/Rect';
import { Shape } from 'src/physics/bodies/types';
import { Vector } from 'src/physics/Vector';
import { World } from 'src/physics/World';
import { GameEntity } from './GameEntity';
import { Renderer } from './Renderer';

enum DirectionKey {
    ArrowUp = 'ArrowUp',
    ArrowRight = 'ArrowRight',
    ArrowDown = 'ArrowDown',
    ArrowLeft = 'ArrowLeft',
}

export class Controls {
    private keyMem = new Set<string>();

    constructor(private world: World, private player: GameEntity, private renderer: Renderer) {
        this.initKeyBindings();
    }

    initKeyBindings(): void {
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key in DirectionKey || e.key === ' ') {
                e.preventDefault();

                switch (e.key) {
                    case DirectionKey.ArrowUp:
                        this.keyMem.add(e.key);
                        break;
                    case DirectionKey.ArrowRight:
                        this.keyMem.add(e.key);
                        break;
                    case DirectionKey.ArrowDown:
                        this.keyMem.add(e.key);
                        break;
                    case DirectionKey.ArrowLeft:
                        this.keyMem.add(e.key);
                        break;
                }
            }
        });

        document.addEventListener('keyup', (e: KeyboardEvent) => {
            if (e.key in DirectionKey || e.key === ' ') {
                switch (e.key) {
                    case DirectionKey.ArrowUp:
                    case DirectionKey.ArrowRight:
                    case DirectionKey.ArrowDown:
                    case DirectionKey.ArrowLeft:
                        this.keyMem.delete(e.key);
                        break;
                }
            }
        });

        this.renderer.worldElement.addEventListener('click', (e: PointerEvent) => {
            this.createCircleForce(e);
        });
    }

    isPressed(key: string): boolean {
        return this.keyMem.has(key);
    }

    update(): void {
        const movement = new Vector();

        if (this.isPressed(DirectionKey.ArrowUp)) {
            movement.y = -1;
        }
        if (this.isPressed(DirectionKey.ArrowRight)) {
            movement.x = 1;
        }
        if (this.isPressed(DirectionKey.ArrowDown)) {
            movement.y = 1;
        }
        if (this.isPressed(DirectionKey.ArrowLeft)) {
            movement.x = -1;
        }

        if (Vector.magnitude(movement)) {
            this.player.move(movement);
        }
    }

    private createCircleForce(e: PointerEvent): void {
        const shape = new Circle(24);
        this.createForceForShape(e, shape);
    }

    private createRectForce(e: PointerEvent): void {
        const shape = new Rect();
        this.createForceForShape(e, shape);
    }

    private createForceForShape(e: PointerEvent, shape: Shape): void {
        const worldX = e.x - this.renderer.worldElement.offsetLeft;
        const worldY = e.y - this.renderer.worldElement.offsetTop;

        shape.moveTo(new Vector(worldX, worldY));

        const bodiesInRange = this.world.getBodiesIntersectingShape(shape);

        for (const body of bodiesInRange) {
            const forceDirection = Vector.subtract(body.pos, shape.pos);
            const force = Vector.rescale(forceDirection, 1);
            body.applyForce(force);
        }
    }
}
