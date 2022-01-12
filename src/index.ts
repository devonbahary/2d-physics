import { World } from './physics/World';
import { Controls } from './game/Controls';
import { Renderer } from './game/Renderer';
import { GameEntity } from './game/GameEntity';
import { Vector } from './physics/Vector';
import { scaleToPhysicsLength } from './game/utilities';
import { RectBody } from './physics/bodies/RectBody';
import { setupEnvironmentA } from './game/environments/environmentA';

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

world.addBody(player.body);

const renderer = new Renderer(world, player.body);
const controls = new Controls(player);

setInterval(() => {
    world.update();
    renderer.update();
    controls.update();
}, 1000 / 60);

console.log(world);

setupEnvironmentA(world);