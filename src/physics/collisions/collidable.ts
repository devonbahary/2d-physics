import { CollisionEvent } from './types';

type OnCollisionCallback = (collisionEvent: CollisionEvent) => void;

export class Collidable {
    private onCollisionCallbacks: OnCollisionCallback[] = [];

    onCollision(collisionEvent: CollisionEvent): void {
        for (const onCollisionCallback of this.onCollisionCallbacks) {
            onCollisionCallback(collisionEvent);
        }
    }

    addCollisionCallback(onCollisionCallback: OnCollisionCallback): void {
        this.onCollisionCallbacks.push(onCollisionCallback);
    }

    clearCollisionCallbacks(): void {
        this.onCollisionCallbacks = [];
    }
}
