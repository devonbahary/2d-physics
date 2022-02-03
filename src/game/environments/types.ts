import { World } from 'src/physics/World';
import { GameEntity } from '../GameEntity';
import { RendererOptions } from '../Renderer';

export type EnvironmentGenerator = () => {
    world: World;
    player: GameEntity;
    rendererOptions?: RendererOptions;
};
