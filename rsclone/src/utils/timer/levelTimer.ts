import Picture from "../classes/canvasBtn";
import { timerData } from "./levelTimerData";

export default class Timer {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    x: number;
    y: number;
    min: number;
    sec: number;
    isRunning: boolean;
    strip: { gold: string; silver: string; x: number; y: number; width: number; height: number; };
    goldMin: number;
    goldSec: number;
    silvMin: number;
    silvSec: number;
    textX: number;
    textY: number;
    goldImg: HTMLImageElement;
    silvImg: HTMLImageElement;
    level: number;

    constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, level: number) {
        this.canvas = canvas;
        this.context = context;
        this.level = level;
        this.x = 1388;
        this.y = 1183;
        this.min = 0;
        this.sec = 0;
        this.isRunning = true;
        this.goldMin = timerData[this.level - 1].goldMin;
        this.goldSec = timerData[this.level - 1].goldSec;
        this.silvMin = timerData[this.level - 1].silvMin;
        this.silvSec = timerData[this.level - 1].silvSec;
        this.textX = timerData[this.level - 1].x;
        this.textY = timerData[this.level - 1].y;
        this.strip = {
            gold: "images/level/uiLevel/play_strip.png",
            silver: "images/level/uiLevel/play_strip_silver.png",
            x: 1470,
            y: 1148,
            width: 120,
            height: 48
        };
        this.goldImg = new Image();
        this.goldImg.src = this.strip.gold;

        this.silvImg = new Image();
        this.silvImg.src = this.strip.silver;
    }

    private content(min: number, sec: number) {
        return (min <= 9 ? `0${min}` : min) + ":" + (sec <= 10 ? `0${Math.trunc(sec)}` : Math.trunc(sec));
    }

    public drawText() {
        this.context.font = "30px Vag_Rounded-Bold CY";
        this.context.fillStyle = "white";

        if (this.min >= 60) return;
        this.context.fillText(this.content(this.min, this.sec), this.x, this.y);

        if (this.isRunning) this.updateTimer();
        this.drawStrip();
    }

    private updateTimer() {
        if (this.sec >= 60) {
            this.sec = 0;
            this.min += 1;
        }
        this.sec += (1 / 60);
    }

    public drawStrip() {
        const image = new Picture((this.min >= this.goldMin && this.sec >= this.goldSec ? this.silvImg : this.goldImg), this.strip.x, this.strip.y, this.strip.width, this.strip.height);
        image.draw(this.context);
        
        if (this.min >= this.goldMin && this.sec >= this.goldSec) {
            this.context.fillStyle = "#f7f9f7";
            this.context.fillText(this.content(this.silvMin, this.silvSec), this.textX, this.textY);
        } else {
            this.context.fillStyle = "yellow";
            this.context.fillText(this.content(this.goldMin, this.goldSec), this.textX, this.textY);
        }
    }
}