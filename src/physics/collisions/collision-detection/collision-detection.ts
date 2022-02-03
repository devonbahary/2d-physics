import { Shape } from '../../bodies/types';
import { ErrorMessage } from '../../constants';
import { Circle } from 'src/physics/bodies/shapes/Circle';
import { Vector } from 'src/physics/Vector';
import { Rect } from 'src/physics/bodies/shapes/Rect';
import { roundForFloatingPoint } from 'src/physics/math/math.utilities';

export const intersects = (shapeA: Shape, shapeB: Shape, includeOverlap = false): boolean => {
    if (shapeA instanceof Circle && shapeB instanceof Circle) {
        return doCirclesIntersect(shapeA, shapeB, includeOverlap);
    }

    if (shapeA instanceof Circle && shapeB instanceof Rect) {
        return doCircleAndRectIntersect(shapeA, shapeB, includeOverlap);
    }

    if (shapeA instanceof Rect && shapeB instanceof Circle) {
        return doCircleAndRectIntersect(shapeB, shapeA, includeOverlap);
    }

    if (shapeA instanceof Rect && shapeB instanceof Rect) {
        return doRectsIntersect(shapeA, shapeB, includeOverlap);
    }

    throw new Error(ErrorMessage.unexpectedBodyType);
};

const doCirclesIntersect = (circleA: Circle, circleB: Circle, includeOverlap: boolean): boolean => {
    const diffPos = Vector.subtract(circleB.pos, circleA.pos);
    const distanceBetweenCenters = roundForFloatingPoint(Vector.magnitude(diffPos));
    const lengthRadii = circleA.radius + circleB.radius;
    return includeOverlap ? distanceBetweenCenters <= lengthRadii : distanceBetweenCenters < lengthRadii;
};

// https://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
const doCircleAndRectIntersect = (circle: Circle, rect: Rect, includeOverlap: boolean): boolean => {
    const dx = Math.abs(circle.x - rect.x);
    const dy = Math.abs(circle.y - rect.y);

    const rectHalfWidth = rect.width / 2;
    const rectHalfHeight = rect.height / 2;

    const toleranceX = rectHalfWidth + circle.radius;
    const toleranceY = rectHalfHeight + circle.radius;

    if (includeOverlap) {
        if (dx > toleranceX) return false;
        if (dy > toleranceY) return false;

        if (dx <= rectHalfWidth) return true;
        if (dy <= rectHalfHeight) return true;
    } else {
        if (dx >= toleranceX) return false;
        if (dy >= toleranceY) return false;

        if (dx < rectHalfWidth) return true;
        if (dy < rectHalfHeight) return true;
    }

    const cornerDistance = roundForFloatingPoint((dx - rectHalfWidth) ** 2 + (dy - rectHalfHeight) ** 2);

    return includeOverlap ? cornerDistance <= circle.radius ** 2 : cornerDistance < circle.radius ** 2;
};

const doRectsIntersect = (rectA: Rect, rectB: Rect, includeOverlap: boolean): boolean => {
    if (includeOverlap) {
        return rectA.x0 <= rectB.x1 && rectA.x1 >= rectB.x0 && rectA.y0 <= rectB.y1 && rectA.y1 >= rectB.y0;
    }
    return rectA.x0 < rectB.x1 && rectA.x1 > rectB.x0 && rectA.y0 < rectB.y1 && rectA.y1 > rectB.y0;
};
