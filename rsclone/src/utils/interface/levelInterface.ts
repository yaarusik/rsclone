import { IPicture, IButton, IText } from "../../application/iterfaces";
import Common from "./../../application/common/common";
import { lvlInterfaceImg, lvlInterfaceBtn, lvlInterfaceAnim, levelTextOptions } from './../gameData/levelData';

export default class LevelInterface extends Common {
  initialImg: HTMLImageElement[];
  initialBtn: HTMLImageElement[];
  initialAnim: HTMLImageElement[];
  lvlInterface: {
    img: IPicture[],
    btn: IButton[],
    anim: IButton[],
    text: IText[]
  };

  constructor (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    super(canvas, context);
    this.initialImg = [];
    this.initialBtn = [];
    this.initialAnim = [];

    this.lvlInterface = {
      btn: JSON.parse(JSON.stringify(lvlInterfaceBtn)),
      anim: JSON.parse(JSON.stringify(lvlInterfaceAnim)),
      text: JSON.parse(JSON.stringify(levelTextOptions)),
      img: JSON.parse(JSON.stringify(lvlInterfaceImg)),
    };

    this.startPanel();
  }

  private async startPanel() {
    const loadImage = this.lvlInterface.img.map(image => this.loadImage(image.image));
    const loadBtn = this.lvlInterface.btn.map(image => this.loadImage(image.image));
    const loadAnim = this.lvlInterface.anim.map(image => this.loadImage(image.image));
    this.initialBtn = await this.renderImages(loadBtn);
    this.initialImg = await this.renderImages(loadImage);
    this.initialAnim = await this.renderImages(loadAnim);
  }

  public render() {
    this.drawImage(this.initialImg, this.lvlInterface.img);
    this.drawImage(this.initialBtn, this.lvlInterface.btn);
    this.drawImage(this.initialAnim, this.lvlInterface.anim);
    this.drawText(this.lvlInterface.text);
  }

  public getData() {
    return this.lvlInterface;
  }





}