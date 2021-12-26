import { CircleBody } from 'src/physics/bodies/CircleBody';
import { Vector } from 'src/physics/Vector';
import { gamePosToPhysicsPos } from './utilities';

export class Player {
    public body = new CircleBody();

    // translate game coordinates to physics coordinates
    moveTo(pos: Vector): void {
        const translatedPos = gamePosToPhysicsPos(pos, this.body);
        this.body.moveTo(translatedPos);
    }
}
