import { CircleBody } from 'src/physics/bodies/CircleBody';
import { Body } from 'src/physics/bodies/types';
import { getCollisionEvent } from 'src/physics/collisions/continuous-collision-detection/continuous-collision-detection';
import {
    isCircleVsCircleCollisionEvent,
    isCircleVsRectCollisionEvent,
    isRectVsCircleCollisionEvent,
    isRectVsRectCollisionEvent,
} from 'src/physics/collisions/collision-event.utility';
import { CollisionEvent } from 'src/physics/collisions/types';
import { ErrorMessage } from 'src/physics/constants';
import { Vector } from 'src/physics/Vector';
import { World } from 'src/physics/World';
import { gamePosToPhysicsPos } from './utilities';

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

            return;
        } else if (isCircleVsRectCollisionEvent(collisionEvent)) {
            const { timeOfCollision, pointOfContact } = collisionEvent;

            this.body.progressMovement(timeOfCollision);
            const diffPos = Vector.subtract(pointOfContact, this.body.pos);
            const tangentOfContact = Vector.normal(diffPos);

            const slideVector = Vector.proj(this.body.velocity, tangentOfContact);
            this.body.setVelocity(slideVector);

            return;
        } else if (isRectVsCircleCollisionEvent(collisionEvent)) {
            const { collisionBody, timeOfCollision, pointOfContact } = collisionEvent;

            this.body.progressMovement(timeOfCollision);
            const diffPos = Vector.subtract(collisionBody.pos, pointOfContact);
            const tangentOfContact = Vector.normal(diffPos);

            const slideVector = Vector.proj(this.body.velocity, tangentOfContact);
            this.body.setVelocity(slideVector);

            return;
        } else if (isRectVsRectCollisionEvent(collisionEvent)) {
            const { movingBody, timeOfCollision, pointOfContact } = collisionEvent;

            this.body.progressMovement(timeOfCollision);
            const diffPos = Vector.subtract(pointOfContact, movingBody.pos);
            const tangentOfContact = Vector.normal(diffPos);

            const slideVector = Vector.proj(this.body.velocity, tangentOfContact);
            this.body.setVelocity(slideVector);

            return;
        }

        throw new Error(ErrorMessage.unexpectedBodyType);
    }
}
