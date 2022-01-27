import { CircleBody } from '../bodies/CircleBody';
import { RectBody } from '../bodies/RectBody';
import {
    CircleVsCircleCollisionEvent,
    CircleVsRectCollisionEvent,
    CollisionEvent,
    RectVsCircleCollisionEvent,
    RectVsRectCollisionEvent,
} from './types';

export const isCircleVsCircleCollisionEvent = (
    collisionEvent: CollisionEvent,
): collisionEvent is CircleVsCircleCollisionEvent => {
    const { movingBody, collisionBody } = collisionEvent;
    return movingBody instanceof CircleBody && collisionBody instanceof CircleBody;
};

export const isCircleVsRectCollisionEvent = (
    collisionEvent: CollisionEvent,
): collisionEvent is CircleVsRectCollisionEvent => {
    const { movingBody, collisionBody } = collisionEvent;
    return movingBody instanceof CircleBody && collisionBody instanceof RectBody;
};

export const isRectVsCircleCollisionEvent = (
    collisionEvent: CollisionEvent,
): collisionEvent is RectVsCircleCollisionEvent => {
    const { movingBody, collisionBody } = collisionEvent;
    return movingBody instanceof RectBody && collisionBody instanceof CircleBody;
};

export const isRectVsRectCollisionEvent = (
    collisionEvent: CollisionEvent,
): collisionEvent is RectVsRectCollisionEvent => {
    const { movingBody, collisionBody } = collisionEvent;
    return movingBody instanceof RectBody && collisionBody instanceof RectBody;
};
