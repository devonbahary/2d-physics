import { Collision } from './types';

type CollisionEvent = (collision: Collision) => void;

export class Collidable {
    private collisionEvents: CollisionEvent[] = [];

    onCollision(collision: Collision): void {
        for (const collisionEvent of this.collisionEvents) {
            collisionEvent(collision);
        }
    }

    addCollisionEvent(collisionEvent: CollisionEvent): void {
        this.collisionEvents.push(collisionEvent);
    }

    clearCollisionEvents(): void {
        this.collisionEvents = [];
    }
}
