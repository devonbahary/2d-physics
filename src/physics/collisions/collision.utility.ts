import { CircleBody } from '../bodies/CircleBody';
import { RectBody } from '../bodies/RectBody';
import {
    CircleVsCircleCollision,
    CircleVsRectCollision,
    Collision,
    RectVsCircleCollision,
    RectVsRectCollision,
} from './types';

export const isCircleVsCircleCollision = (
    collision: Collision,
): collision is CircleVsCircleCollision => {
    const { movingBody, collisionBody } = collision;
    return movingBody instanceof CircleBody && collisionBody instanceof CircleBody;
};

export const isCircleVsRectCollision = (
    collision: Collision,
): collision is CircleVsRectCollision => {
    const { movingBody, collisionBody } = collision;
    return movingBody instanceof CircleBody && collisionBody instanceof RectBody;
};

export const isRectVsCircleCollision = (
    collision: Collision,
): collision is RectVsCircleCollision => {
    const { movingBody, collisionBody } = collision;
    return movingBody instanceof RectBody && collisionBody instanceof CircleBody;
};

export const isRectVsRectCollision = (
    collision: Collision,
): collision is RectVsRectCollision => {
    const { movingBody, collisionBody } = collision;
    return movingBody instanceof RectBody && collisionBody instanceof RectBody;
};
