import { CircleBody } from 'src/physics/bodies/CircleBody';
import { Vector } from 'src/physics/Vector';
import { gamePosToPhysicsPos } from './utilities';

export class GameEntity {
    public body = new CircleBody();
    public speed = 1;

    // translate game coordinates to physics coordinates
    moveTo(pos: Vector): void {
        const translatedPos = gamePosToPhysicsPos(pos, this.body);
        this.body.moveTo(translatedPos);
    }

    move(dir: Vector): void {
        this.body.velocity = Vector.rescale(dir, this.speed);
    }
}
