import { World } from './physics/World';
import { Controls } from './game/Controls';
import { Renderer } from './game/Renderer';
import { GameEntity } from './game/GameEntity';
import { Vector } from './physics/Vector';
import { scaleToPhysicsLength } from './game/utilities';

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

const character = new GameEntity();
character.body.name = 'character';

character.moveTo(new Vector(3, 3));
character.body.setFixed(true);

world.addBody(player.body);
world.addBody(character.body);

const renderer = new Renderer(world, player.body);
const controls = new Controls(player);

setInterval(() => {
    world.update();
    renderer.update();
    controls.update();
}, 1000 / 60);

console.log(world);
