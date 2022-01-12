import { CircleBody } from 'src/physics/bodies/CircleBody';
import { Body } from 'src/physics/bodies/types';
import { Vector } from 'src/physics/Vector';
import { gamePosToPhysicsPos } from './utilities';

export class GameEntity {
    public speed = 1;

    constructor(public body: Body = new CircleBody()) {}

    // translate game coordinates to physics coordinates
    moveTo(pos: Vector): void {
        const translatedPos = gamePosToPhysicsPos(pos, this.body);
        this.body.moveTo(translatedPos);
    }

    move(dir: Vector): void {
        const movement = Vector.rescale(dir, this.speed);
        this.body.setVelocity(movement);
    }
}
