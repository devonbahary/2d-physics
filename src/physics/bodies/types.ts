import { CircleBody } from './CircleBody';
import { RectBody } from './RectBody';
import { Circle } from './shapes/Circle';
import { Rect } from './shapes/Rect';

export type Shape = Circle | Rect;
export type Body = CircleBody | RectBody;
