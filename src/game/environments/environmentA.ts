import { RectBody } from 'src/physics/bodies/RectBody';
import { Vector } from 'src/physics/Vector';
import { World } from 'src/physics/World';
import { GameEntity } from '../GameEntity';
import { scaleToPhysicsLength } from '../utilities';

const settings = {
    world: {
        tileWidth: 5,
        tileHeight: 5,
    },
};

export const setupEnvironmentA = (): [World, GameEntity] => {    
    const world = new World(
        scaleToPhysicsLength(settings.world.tileWidth),
        scaleToPhysicsLength(settings.world.tileHeight),
    );

    const player = new GameEntity(world, new RectBody());
    player.body.name = 'player';

    player.moveTo(new Vector(Math.floor(settings.world.tileWidth / 2), Math.floor(settings.world.tileHeight / 2)));

    world.addBody(player.body);

    const circle = new GameEntity(world);
    circle.body.name = 'circle';
    // circle.body.setFixed(true);

    const fixedCircle = new GameEntity(world);
    fixedCircle.body.name = 'fixed-circle';
    fixedCircle.body.setFixed(true);

    const rect = new GameEntity(world, new RectBody());
    rect.body.name = 'rect';
    // rect.body.setFixed(true);

    const fixedRect = new GameEntity(world, new RectBody());
    fixedRect.body.name = 'fixed-rect';
    fixedRect.body.setFixed(true);

    circle.moveTo(new Vector(3, 1));
    rect.moveTo(new Vector(1, 1));
    fixedCircle.moveTo(new Vector(3, 3));
    fixedRect.moveTo(new Vector(1, 3));

    world.addBody(circle.body);
    world.addBody(rect.body);
    world.addBody(fixedCircle.body);
    world.addBody(fixedRect.body);

    return [ world, player ];
};
