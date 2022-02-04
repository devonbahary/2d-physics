import { CircleBody } from 'src/physics/bodies/CircleBody';
import { Body } from 'src/physics/bodies/types';
import { getClosestCollision } from 'src/physics/collisions/continuous-collision-detection/continuous-collision-detection';
import { Collision } from 'src/physics/collisions/types';
import { Vector } from 'src/physics/Vector';
import { World } from 'src/physics/World';
import { gamePosToWorldPos } from './utilities';
import { getTangentialMovementVector } from 'src/physics/collisions/collision-resolver.utility';
import { Collidable } from 'src/physics/collisions/Collidable';

export class GameEntity {
    public speed = 1;
    public collisions = new Collidable();

    constructor(private world: World, public body: Body = new CircleBody()) {
        this.body.collisions.addCollisionEvent((collision) => {
            this.collisions.onCollision(collision);
        });
    }

    moveTo(gamePos: Vector): void {
        const pos = gamePosToWorldPos(gamePos, this.body);
        this.body.moveTo(pos);
    }

    move(dir: Vector): void {
        const movement = Vector.rescale(dir, this.speed);
        this.body.setVelocity(movement);

        const collision = getClosestCollision(this.body, this.world.bodies);
        if (collision?.collisionBody.isFixed) this.moveTangentToCollisionBody(collision);
    }

    private moveTangentToCollisionBody(collision: Collision): void {
        const { timeOfCollision } = collision;

        this.body.progressMovement(timeOfCollision);

        const tangentialMovementVector = getTangentialMovementVector({
            ...collision,
            timeOfCollision: 0,
        });

        this.body.setVelocity(tangentialMovementVector);
    }
}
