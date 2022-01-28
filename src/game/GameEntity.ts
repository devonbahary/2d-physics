import { CircleBody } from 'src/physics/bodies/CircleBody';
import { Body } from 'src/physics/bodies/types';
import { getCollisionEvent } from 'src/physics/collisions/continuous-collision-detection/continuous-collision-detection';
import { CollisionEvent } from 'src/physics/collisions/types';
import { Vector } from 'src/physics/Vector';
import { World } from 'src/physics/World';
import { gamePosToPhysicsPos } from './utilities';
import { getTangentialMovementVector } from 'src/physics/collisions/collision-resolver.utility';

export class GameEntity {
    public speed = 1;

    constructor(private world: World, public body: Body = new CircleBody()) {}

    // accepts game coordinates
    moveTo(pos: Vector): void {
        const translatedPos = gamePosToPhysicsPos(pos, this.body);
        this.body.moveTo(translatedPos);
    }

    move(dir: Vector): void {
        const movement = Vector.rescale(dir, this.speed);
        this.body.setVelocity(movement);

        const collisionEvent = getCollisionEvent(this.body, this.world.bodies);
        if (collisionEvent?.collisionBody.isFixed) this.moveTangentToCollisionBody(collisionEvent);
    }

    private moveTangentToCollisionBody(collisionEvent: CollisionEvent): void {
        const { timeOfCollision } = collisionEvent;

        this.body.progressMovement(timeOfCollision);

        const tangentialMovementVector = getTangentialMovementVector({
            ...collisionEvent,
            timeOfCollision: 0,
        });

        this.body.setVelocity(tangentialMovementVector);
    }
}
