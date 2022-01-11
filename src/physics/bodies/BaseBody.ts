import { v4 as uuid } from 'uuid';
import { Vector } from '../Vector';
import { Circle } from './shapes/Circle';
import { Rect } from './shapes/Rect';

const MIN_VELOCITY_MAG = 0.1;

export abstract class BaseBody {
    public mass = 1;
    public velocity = new Vector();
    public id = uuid();
    public name = '';

    constructor(protected shape: Circle | Rect) {}

    get x(): number {
        return this.shape.x;
    }

    get y(): number {
        return this.shape.y;
    }

    get pos(): Vector {
        return new Vector(this.x, this.y);
    }

    get x0(): number {
        return this.shape.x0;
    }

    get x1(): number {
        return this.shape.x1;
    }

    get y0(): number {
        return this.shape.y0;
    }

    get y1(): number {
        return this.shape.y1;
    }

    get width(): number {
        return this.shape.width;
    }

    get height(): number {
        return this.shape.height;
    }

    applyForce(force: Vector): void {
        this.velocity = Vector.add(this.velocity, Vector.divide(force, this.mass));
    }

    moveTo(pos: Vector): void {
        this.shape.moveTo(pos);
    }

    isMoving(): boolean {
        return Boolean(this.velocity.magnitude);
    }

    applyFriction(): void {
        const velocityMagAfterFriction = Vector.magnitude(this.velocity) * 0.8;
        this.velocity =
            velocityMagAfterFriction >= MIN_VELOCITY_MAG
                ? Vector.rescale(this.velocity, velocityMagAfterFriction)
                : new Vector();
    }

    progressMovement(time = 1): void {
        const movement = Vector.mult(this.velocity, time);
        const newPos = Vector.add(this.pos, movement);
        this.moveTo(newPos);
    }
}
