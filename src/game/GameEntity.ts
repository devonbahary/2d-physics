import { CircleBody } from 'src/physics/bodies/CircleBody';
import { Body } from 'src/physics/bodies/types';
import { getCollisionEvent } from 'src/physics/collisions/collision-detection.utility';
import {
    isCircleVsCircleCollisionEvent,
    isCircleVsRectCollisionEvent,
} from 'src/physics/collisions/collision-resolver.utility';
import { CollisionEvent } from 'src/physics/collisions/types';
import { ErrorMessage } from 'src/physics/constants';
import { Vector } from 'src/physics/Vector';
import { World } from 'src/physics/World';
import { gamePosToPhysicsPos } from './utilities';

export class GameEntity {
    public speed = 1;

    constructor(private world: World, public body: Body = new CircleBody()) {}

    // translate game coordinates to physics coordinates
    moveTo(pos: Vector): void {
        const translatedPos = gamePosToPhysicsPos(pos, this.body);
        this.body.moveTo(translatedPos);
    }

    move(dir: Vector): void {
        const movement = Vector.rescale(dir, this.speed);
        this.body.setVelocity(movement);

        const collisionEvent = getCollisionEvent(this.body, this.world.bodies);
        if (collisionEvent?.collisionBody.isFixed) this.slideAroundBody(collisionEvent);
    }

    private slideAroundBody(collisionEvent: CollisionEvent): void {
        if (isCircleVsCircleCollisionEvent(collisionEvent)) {
            const { collisionBody, timeOfCollision } = collisionEvent;

            this.body.progressMovement(timeOfCollision);
            const diffPos = Vector.subtract(collisionBody.pos, this.body.pos);
            const tangentOfContact = Vector.normal(diffPos);

            const slideVector = Vector.proj(this.body.velocity, tangentOfContact);
            this.body.setVelocity(slideVector);
        } else if (isCircleVsRectCollisionEvent(collisionEvent)) {
            const { timeOfCollision, pointOfContact } = collisionEvent;

            this.body.progressMovement(timeOfCollision);
            const diffPos = Vector.subtract(pointOfContact, this.body.pos);
            const tangentOfContact = Vector.normal(diffPos);

            const slideVector = Vector.proj(this.body.velocity, tangentOfContact);
            this.body.setVelocity(slideVector);
        }

        throw new Error(ErrorMessage.unexpectedBodyType);
    }
}
