import { World } from './physics/World';
import { Controls } from './game/Controls';
import { Renderer } from './game/Renderer';
import { GameEntity } from './game/GameEntity';
import { Vector } from './physics/Vector';
import { scaleToPhysicsLength } from './game/utilities';
import { RectBody } from './physics/bodies/RectBody';

const settings = {
    world: {
        tileWidth: 5,
        tileHeight: 5,
    },
};

const world = new World(
    scaleToPhysicsLength(settings.world.tileWidth),
    scaleToPhysicsLength(settings.world.tileHeight),
);

const player = new GameEntity();
player.body.name = 'player';

player.moveTo(new Vector(Math.floor(settings.world.tileWidth / 2), Math.floor(settings.world.tileHeight / 2)));

const circle = new GameEntity();
circle.body.name = 'circle';

circle.moveTo(new Vector(3, 3));
circle.body.setFixed(true);

const rect = new GameEntity(new RectBody());
rect.body.name = 'rect';

rect.moveTo(new Vector(1, 3));
rect.body.setFixed(true);

world.addBody(player.body);
world.addBody(circle.body);
world.addBody(rect.body);

const renderer = new Renderer(world, player.body);
const controls = new Controls(player);

setInterval(() => {
    world.update();
    renderer.update();
    controls.update();
}, 1000 / 60);

console.log(world);
