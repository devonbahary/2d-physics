import { World } from 'src/physics/World';
import { Sprite } from './Sprite';
import { CircleBody } from 'src/physics/bodies/CircleBody';
import { RectBody } from 'src/physics/bodies/RectBody';
import { scaleToGameLength, scaleToPhysicsLength } from './utilities';
import 'normalize.css';
import './styles.css';

type Body = CircleBody | RectBody;

export class Renderer {
    private worldElement: HTMLElement;
    private sprites: Sprite[] = [];

    constructor(private world: World, player: Body) {
        this.initWorldElement();
        this.addPlayer(player);
    }

    static createBodyElement(body: Body): HTMLElement {
        const bodyElement = document.createElement('div');
        bodyElement.classList.add('body');

        if (body instanceof CircleBody) {
            bodyElement.classList.add('circle');
        }

        return bodyElement;
    }

    private addPlayer(player: Body): void {
        const playerElement = Renderer.createBodyElement(player);
        playerElement.id = 'player';
        this.addBody(player, playerElement);
    }

    public addBody(body: Body, bodyElement = Renderer.createBodyElement(body)): void {
        this.worldElement.appendChild(bodyElement);
        const bodySprite = new Sprite(body, bodyElement);
        this.sprites.push(bodySprite);
    }

    public update(): void {
        this.syncWorldBodies();
        
        for (const sprite of this.sprites) {
            sprite.update();
        }
    }

    private initWorldElement(): void {
        this.worldElement = document.createElement('div');
        this.worldElement.id = 'world';
        this.worldElement.style.width = `${this.world.width}px`;
        this.worldElement.style.height = `${this.world.height}px`;
        document.body.appendChild(this.worldElement);

        this.initTileGrid();
    }

    private initTileGrid(): void {
        const className = 'tile-grid';
        const thickness = '1px';
        const border = '1px dotted grey';

        const tilesWidth = scaleToGameLength(this.world.width);
        const tilesHeight = scaleToGameLength(this.world.height);

        for (let i = 1; i < tilesWidth; i += 1) {
            const latitudinalLine = document.createElement('span');
            latitudinalLine.classList.add(className);
            
            Object.assign(latitudinalLine.style, {
                left: `${scaleToPhysicsLength(i)}px`,
                width: thickness,
                height: this.worldElement.style.height,
                borderLeft: border,
            });

            this.worldElement.appendChild(latitudinalLine);

            for (let i = 1; i < tilesHeight; i += 1) {
                const longitudinalLine = document.createElement('span');
                longitudinalLine.classList.add(className);
                
                Object.assign(longitudinalLine.style, {
                    top: `${i * 24}px`,
                    width: this.worldElement.style.width,
                    height: thickness,
                    borderTop: border,
                });

                this.worldElement.appendChild(longitudinalLine);
            }
        }
    }

    private syncWorldBodies(): void {
        for (const body of this.world.bodies) {
            if (this.sprites.some(sprite => sprite.body.id === body.id)) return;
            
            this.addBody(body);
        }
    }
}
