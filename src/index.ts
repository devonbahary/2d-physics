import { Controls } from './game/Controls';
import { Renderer } from './game/Renderer';
import { setupChaos } from './game/environments/chaos';
import { setupRails } from './game/environments/rails';

const [world, player] = setupRails();

const renderer = new Renderer(world, player.body);
const controls = new Controls(world, player, renderer);

setInterval(() => {
    world.update();
    renderer.update();
    controls.update();
}, 1000 / 60);

console.log(world);
