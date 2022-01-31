import { IButton, IPicture } from "../../application/iterfaces";
export default class Well {
  userInterfaceOptions: IPicture[];
  animationImage: IButton[];
  constructor (iterfaceOption: IPicture[]) {
    this.userInterfaceOptions = iterfaceOption;
    this.animationImage = <IButton[]>this.userInterfaceOptions.filter(anim => anim.type === "animation");
  }
  public wellAnimation(btn: IButton, animState: { [key: string]: boolean; }) {
    let frameY = 0;
    const timer = setInterval(() => {
      if (btn.frameY) {
        if (frameY < btn.frameY - 1) {
          btn.sy += btn.stepY;
          frameY++;
        } else {
          frameY = 0;
          btn.sy = 0;
        }
      }
    }, 50);
    // останавливать в зависимости от индикатора
    setTimeout(() => {
      clearInterval(timer);
      animState.well = true;
      btn.sy = 0;
    }, 2400);
  }

  // водный индикатор
  public waterIndicatorChange() {
    const waterIndicator = <IButton>this.animationImage.find(item => item.name === 'waterIndicator');
    const maxHeight = waterIndicator.sheight * <number>waterIndicator.frameY;
    const step = 5;
    if (waterIndicator.sy < maxHeight) {
      waterIndicator.sy += step * waterIndicator.stepY;
    } else {
      waterIndicator.sy = 0;
    }
  }

  // пополнение воды
  public fullWaterIndicator(animState: { [key: string]: boolean; }) {
    const water = <IButton>this.animationImage.find(item => item.name === 'waterIndicator');
    let frameY = 0;
    const timer = setInterval(() => {
      if (water.frameY) {
        if (frameY < water.frameY - 1) {
          water.sy -= water.stepY;
          frameY++;
        } else {
          frameY = 0;
          water.sy = 0;
        }
      }
    }, 100);
    //дизейблить кнопку, когда вода еще полностью не закончилась
    setTimeout(() => {
      clearInterval(timer);
      animState.waterIndicator = true;
      water.sy = 0;
    }, 2400);
  }

}