export enum Axis {
    x = 'x',
    y = 'y',
}

export type TimeOfCollision = number | null;

export type RectVsRectPossibleCollision = {
    movingBoundary: number;
    collisionBoundary: number;
    axisOfCollision: Axis;
};

export type RectVsCirclePossibleCollision = {
    movingRectBoundary: number;
    collisionCircleBoundary: number;
    axisOfCollision: Axis;
};

export type CircleVsRectPossibleCollision = {
    movingCircleBoundary: number;
    collisionRectBoundary: number;
    axisOfCollision: Axis;
};
