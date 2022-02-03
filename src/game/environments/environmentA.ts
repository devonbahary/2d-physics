import { CircleBody } from 'src/physics/bodies/CircleBody';
import { RectBody } from 'src/physics/bodies/RectBody';
import { Vector } from 'src/physics/Vector';
import { World } from 'src/physics/World';
import { GameEntity } from '../GameEntity';
import { scaleToPhysicsLength } from '../utilities';
import { EnvironmentGenerator } from './types';

const TILE_WIDTH = 7;
const TILE_HEIGHT = 7;

export const setupEnvironmentA: EnvironmentGenerator = () => {
    const world = new World({
        width: scaleToPhysicsLength(TILE_WIDTH),
        height: scaleToPhysicsLength(TILE_HEIGHT),
    });

    const player = new GameEntity(world, new CircleBody());
    player.body.name = 'player';

    player.moveTo(new Vector(Math.floor(TILE_WIDTH / 2), Math.floor(TILE_HEIGHT / 2)));

    world.addBody(player.body);

    const circle = new GameEntity(world);
    circle.body.name = 'circle';

    const fixedCircle = new GameEntity(world);
    fixedCircle.body.name = 'fixed-circle';
    fixedCircle.body.setFixed();

    const rect = new GameEntity(world, new RectBody());
    rect.body.name = 'rect';

    const fixedRect = new GameEntity(world, new RectBody());
    fixedRect.body.name = 'fixed-rect';
    fixedRect.body.setFixed();

    circle.moveTo(new Vector(4, 2));
    rect.moveTo(new Vector(2, 2));
    fixedCircle.moveTo(new Vector(4, 4));
    fixedRect.moveTo(new Vector(2, 4));

    world.addBody(circle.body);
    world.addBody(rect.body);
    world.addBody(fixedCircle.body);
    world.addBody(fixedRect.body);

    return { world, player };
};
