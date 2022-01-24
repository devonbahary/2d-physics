import { RectBody } from 'src/physics/bodies/RectBody';
import { Vector } from 'src/physics/Vector';
import { World } from 'src/physics/World';
import { GameEntity } from '../GameEntity';
import { scaleToPhysicsLength } from '../utilities';

const settings = {
    world: {
        tileWidth: 7,
        tileHeight: 7,
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

    const fixedCircle = new GameEntity(world);
    fixedCircle.body.name = 'fixed-circle';
    fixedCircle.body.setFixed(true);

    const rect = new GameEntity(world, new RectBody());
    rect.body.name = 'rect';

    const fixedRect = new GameEntity(world, new RectBody());
    fixedRect.body.name = 'fixed-rect';
    fixedRect.body.setFixed(true);

    circle.moveTo(new Vector(4, 2));
    rect.moveTo(new Vector(2, 2));
    fixedCircle.moveTo(new Vector(4, 4));
    fixedRect.moveTo(new Vector(2, 4));

    world.addBody(circle.body);
    world.addBody(rect.body);
    world.addBody(fixedCircle.body);
    world.addBody(fixedRect.body);

    return [ world, player ];
};
