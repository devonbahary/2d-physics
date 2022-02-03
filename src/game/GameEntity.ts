import { CircleBody } from 'src/physics/bodies/CircleBody';
import { Body } from 'src/physics/bodies/types';
import { getCollisionEvent } from 'src/physics/collisions/continuous-collision-detection/continuous-collision-detection';
import { CollisionEvent } from 'src/physics/collisions/types';
import { Vector } from 'src/physics/Vector';
import { World } from 'src/physics/World';
import { gamePosToWorldPos } from './utilities';
import { getTangentialMovementVector } from 'src/physics/collisions/collision-resolver.utility';
import { Collidable } from 'src/physics/collisions/collidable';

export class GameEntity {
    public speed = 1;
    public collisions = new Collidable();

    constructor(private world: World, public body: Body = new CircleBody()) {
        this.body.collisions.addCollisionCallback((collisionEvent) => {
            this.collisions.onCollision(collisionEvent);
        });
    }

    moveTo(gamePos: Vector): void {
        const pos = gamePosToWorldPos(gamePos, this.body);
        this.body.moveTo(pos);
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
