import { RectBody } from "src/physics/bodies/RectBody";
import { Vector } from "src/physics/Vector";
import { World } from "src/physics/World";
import { GameEntity } from "../GameEntity";

export const setupEnvironmentA = (world: World) => {
    const circle = new GameEntity();
    circle.body.name = 'circle';

    const fixedCircle = new GameEntity();
    fixedCircle.body.name = 'fixed-circle';
    fixedCircle.body.setFixed(true);
    
    const rect = new GameEntity(new RectBody());
    rect.body.name = 'rect';

    const fixedRect = new GameEntity(new RectBody());
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
};