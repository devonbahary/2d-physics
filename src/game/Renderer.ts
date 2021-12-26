import { World } from 'src/physics/World';
import 'normalize.css';
import './styles.css';
import { Sprite } from './Sprite';
import { CircleBody } from 'src/physics/bodies/CircleBody';
import { RectBody } from 'src/physics/bodies/RectBody';

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
        for (const sprite of this.sprites) {
            sprite.update();
        }
    }

    private initWorldElement(): void {
        this.worldElement = document.createElement('div');
        this.worldElement.id = 'world';
        this.worldElement.style.width = `${this.world.tilesWidth * 24}px`;
        this.worldElement.style.height = `${this.world.tilesHeight * 24}px`;
        document.body.appendChild(this.worldElement);

        this.initTileGrid();
    }

    private initTileGrid(): void {
        const className = 'tile-grid';
        const thickness = '1px';
        const border = '1px dotted grey';

        for (let i = 1; i < this.world.tilesWidth; i += 1) {
            const latitudinalLine = document.createElement('span');
            latitudinalLine.classList.add(className);
            latitudinalLine.style.left = `${i * 24}px`;
            latitudinalLine.style.width = thickness;
            latitudinalLine.style.height = this.worldElement.style.height;
            latitudinalLine.style.borderRight = border;

            this.worldElement.appendChild(latitudinalLine);

            for (let i = 1; i < this.world.tilesHeight; i += 1) {
                const longitudinalLine = document.createElement('span');
                longitudinalLine.classList.add(className);
                longitudinalLine.style.top = `${i * 24}px`;
                longitudinalLine.style.width = this.worldElement.style.width;
                longitudinalLine.style.height = thickness;
                longitudinalLine.style.borderBottom = border;

                this.worldElement.appendChild(longitudinalLine);
            }
        }
    }
}
