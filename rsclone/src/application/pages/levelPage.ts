
import Control from "../../builder/controller";
import Common from "./../common/common";
import { Coords, IButton, IText, IFunctions } from "./../iterfaces";
import Coin from "../../utils/animation/coin";
import Timer from "../../utils/timer/levelTimer";
import LevelRender from "../common/levelRender";
import PausePanel from "../../utils/panels/pausePanel";
import StartPanel from "../../utils/panels/startPanel";
import LevelInterface from "./../../utils/interface/levelInterface";
import BuildSpawn from "../../utils/animation/spawnBuild";


export default class LevelPage extends Control {
  canvas: Control<HTMLCanvasElement>;
  context: CanvasRenderingContext2D;
  commonFunction: Common;
  levelRender: LevelRender;
  animation: number;
  curWidthK: number;
  curHeightK: number;
  coin: Coin;
  pausePanel: PausePanel;
  click: IFunctions;
  timer: Timer;
  startPanel: StartPanel;
  panelState: { pausePanelSwitch: boolean; startPanelSwitch: boolean; };
  levelInterface: LevelInterface;
  btn: IButton[];
  buildSpawn: BuildSpawn;

  constructor (parentNode: HTMLElement) {
    super(parentNode);

    const canvasContainer = new Control(this.node, "div", "canvas__container", "");
    this.canvas = new Control<HTMLCanvasElement>(canvasContainer.node, "canvas", "canvas", "");

    this.canvas.node.width = 1600;
    this.canvas.node.height = 1200;

    this.curWidthK = 1;
    this.curHeightK = 1;
    this.animation = 0;

    this.panelState = {
      pausePanelSwitch: false,
      startPanelSwitch: true
    };

    this.click = {
      isPaused: () => this.panelState.pausePanelSwitch = false,
      onMain: () => this.onMain(),
      onRestart: () => this.onRestart(),
      onSettings: () => this.onSettings(),
      onMap: () => this.onMap(),
      isStart: () => this.panelState.startPanelSwitch = false,
    };

    this.context = <CanvasRenderingContext2D>this.canvas.node.getContext("2d");
    this.commonFunction = new Common(this.canvas.node, this.context);

    this.levelInterface = new LevelInterface(this.canvas.node, this.context);
    this.startPanel = new StartPanel(this.canvas.node, this.context);
    this.timer = new Timer(this.canvas.node, this.context);
    this.levelRender = new LevelRender(this.canvas.node, this.context);

    this.pausePanel = new PausePanel(this.canvas.node, this.context, this.timer);
    this.buildSpawn = new BuildSpawn(this.canvas.node, this.context);


    const { btn, anim, text } = this.levelInterface.getData();
    this.btn = btn;

    this.coin = new Coin(anim);

    this.startUI();
    this.levelRender.startLevel();

    window.onresize = () => {
      const coefficients = this.commonFunction.canvasScale();
      this.curWidthK = coefficients.curWidthK;
      this.curHeightK = coefficients.curHeightK;
    };

    this.canvas.node.addEventListener("mousemove", (e) => {
      this.canvasMoveHundler(e, [...btn, ...anim], text);
    });

    this.canvas.node.addEventListener("click", (e) => {
      this.canvasClickHundler(e, [...btn, ...anim], text);
    });
  }


  private async startUI() {
    const coefficients = this.commonFunction.canvasScale();
    this.curWidthK = coefficients.curWidthK;
    this.curHeightK = coefficients.curHeightK;

    this.run();
  }

  private async run() {
    this.context.restore(); // Перед каждой отрисовкой возращаем канвасу стандартные настройки прозрачности
    this.context.globalAlpha = 1;
    this.render();

    // upload pause panel
    if (this.panelState.pausePanelSwitch === true) this.pausePanel.render();

    this.animation = requestAnimationFrame(() => {
      this.run();
    });
  }

  private render() {
    this.context.clearRect(0, 0, this.canvas.node.width, this.canvas.node.height);
    this.levelInterface.render();

    if (this.panelState.startPanelSwitch) this.startPanel.render(); // upload start panel
    else {
      this.coin.coinAnimation();
      this.timer.drawText();
      this.buildSpawn.render();
      this.levelRender.renderLevel(this.curWidthK, this.curHeightK);
    }
  }

  private canvasMoveHundler(event: MouseEvent, buttons: IButton[], text: IText[]) {
    this.levelRender.moveHundler(event, this.curWidthK, this.curHeightK);
    if (this.panelState.pausePanelSwitch) this.pausePanel.moveHundler(event, this.curWidthK, this.curHeightK);
    else if (this.panelState.startPanelSwitch) this.startPanel.moveHundler(event, this.curWidthK, this.curHeightK);
    else {
      buttons.forEach(btn => {
        const scaleCoords: Coords = this.commonFunction.scaleCoords(btn, this.curWidthK, this.curHeightK);
        if (this.commonFunction.determineCoords(event, scaleCoords)) {
          this.commonFunction.buttonsHover(btn, btn.stepY, btn.hover);
          this.commonFunction.changeAnimation(btn, true, text);
        } else {
          switch (btn.name) {
            case "pig":
            case "chicken":
            case "cow":
            case "ostrich":
            case "dog":
            case "cat": {
              const hoverCoords = 192;
              const count = 1;
              // если можно купить, ховер работает
              this.commonFunction.buttonsHover(btn, hoverCoords, count);
              break;
            }
            default: {
              this.commonFunction.buttonsHover(btn, 0, 0);
              this.commonFunction.changeAnimation(btn, false, text);
            }
          }
        }
      });
    }
  }

  private canvasClickHundler(event: MouseEvent, buttons: IButton[], text: IText[]) {
    if (this.panelState.pausePanelSwitch) this.pausePanel.clickHundler(event, this.curWidthK, this.curHeightK, this.click, this.animation);
    else if (this.panelState.startPanelSwitch) this.startPanel.clickHundler(event, this.curWidthK, this.curHeightK, this.click);
    else if (!this.levelRender.clickHundler(event, this.curWidthK, this.curHeightK)){
      //взаимодействие с зданиями
      this.buildSpawn.clickHundler(event, this.curWidthK, this.curHeightK);
      buttons.forEach(btn => {
        const scaleCoords: Coords = this.commonFunction.scaleCoords(btn, this.curWidthK, this.curHeightK);
        if (this.commonFunction.determineCoords(event, scaleCoords)) {
          switch (btn.name) {
            case "Меню": {
              this.commonFunction.buttonsClick(btn, btn.stepY, btn.click);
              this.panelState.pausePanelSwitch = true;
              this.timer.isRunning = false;
              break;
            }
            case 'chicken': {
              this.levelRender.createAnimal("chicken");
              this.buildSpawn.changeTotal(btn.name, text);
              this.commonFunction.buttonsClick(btn, btn.stepY, btn.click);
              break;
            }
            case 'pig': {
              // счетчик потом сделать
              this.commonFunction.buttonsClick(btn, btn.stepY, btn.click);
              break;
            }
            case 'mainArea': {
              let rect = this.canvas.node.getBoundingClientRect();
              let clickX = (event.clientX - rect.left) * this.curWidthK;
              let clickY = (event.clientY - rect.top) * this.curHeightK;

              this.levelRender.createGrass(clickX, clickY, this.curWidthK, this.curHeightK);
              break;
            }
            default: console.log("error");
          }
        } else {
          // переделать сброс кнопки
          // this.buttonsClick(btn, 0, 0);
        }
      });
    }
  }

  onMap(): void {
    throw new Error("Method not implemented.");
  }
  onMain(): void {
    throw new Error("Method not implemented.");
  }
  onRestart(): void {
    throw new Error("Method not implemented.");
  }
  onSettings(): void {
    throw new Error("Method not implemented.");
  }
}

