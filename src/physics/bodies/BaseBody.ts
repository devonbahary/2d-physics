import { v4 as uuid } from 'uuid';
import { Collidable } from '../collisions/Collidable';
import { Vector } from '../Vector';
import { Circle } from './shapes/Circle';
import { Rect } from './shapes/Rect';

const MIN_VELOCITY_MAG = 0.1;

export type BaseBodyArgs = {
    elasticity?: number;
    name?: string;
    shape: Circle | Rect;
};

export abstract class BaseBody {
    public mass = 1;
    public id = uuid();
    public name: string;
    public shape: Circle | Rect;
    public collisions = new Collidable();
    private _velocity = new Vector();
    private _isFixed = false;
    private _elasticity = 1; // 0 - 1

    constructor({ elasticity = 0.5, name = '', shape }: BaseBodyArgs) {
        this.name = name;
        this.shape = shape;
        this.setElasticity(elasticity);
    }

    get x(): number {
        return this.shape.x;
    }

    get y(): number {
        return this.shape.y;
    }

    get pos(): Vector {
        return new Vector(this.x, this.y);
    }

    get velocity(): Vector {
        return this._velocity;
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

    get isFixed(): boolean {
        return this._isFixed;
    }

    get elasticity(): number {
        return this._elasticity;
    }

    applyForce(force: Vector): void {
        if (this.isFixed) return; // fixed bodies can be subject to force, but nothing happens
        this._velocity = Vector.add(this._velocity, Vector.divide(force, this.mass));
    }

    setVelocity(vel: Vector): void {
        if (this.isFixed) throw new Error(`cannot set velocity of fixed body`);
        this._velocity = vel;
    }

    setFixed(isFixed = true): void {
        this._isFixed = isFixed;
        if (isFixed) this._velocity = new Vector(); // fixed bodies cannot move
    }

    setElasticity(elasticity: number): void {
        if (elasticity < 0 || elasticity > 1) throw new Error('elasticity can only be 0-1');
        this._elasticity = elasticity;
    }

    moveTo(pos: Vector): void {
        this.shape.moveTo(pos);
    }

    isMoving(): boolean {
        return Boolean(Vector.magnitude(this._velocity));
    }

    applyFriction(): void {
        if (!this.isMoving()) return;

        // slow down body until a minimum stopping speed is reached
        const magAfterFriction = Vector.magnitude(this._velocity) * 0.8;
        const finalMag = magAfterFriction < MIN_VELOCITY_MAG ? 0 : magAfterFriction;

        this._velocity = Vector.rescale(this._velocity, finalMag);
    }

    progressMovement(time = 1): void {
        if (!this.isMoving) return;

        const movement = Vector.mult(this._velocity, time);
        const newPos = Vector.add(this.pos, movement);
        this.moveTo(newPos);
    }
}
