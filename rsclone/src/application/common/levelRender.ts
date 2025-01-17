
import { levelImagesPath } from "../../utils/gameData/levelData";
import { Coords } from "../iterfaces";
import { Grass, AnimalList, Chicken, Product, Pig, Bear, Animal } from "../types";
import Common from "./common";
import { Music } from "../../utils/music/music";


export default class LevelRender {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	commonFunction: Common;
	images = new Map<string, HTMLImageElement>();
	imagesPath: string[];
	animals: AnimalList[];
	products: Product[];
	grass: Grass[];
	areaX: number;
	areaY: number;
	areaWidth: number;
	areaHeight: number;
	id: number;
	heightRatio: number;
	gameFrame: number;
	staggeredFrames: number;
	music: Music;

	constructor (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
		this.canvas = canvas;
		this.context = context;

		this.music = new Music();

		this.commonFunction = new Common(this.canvas, this.context);
		this.imagesPath = levelImagesPath;

		this.animals = [];
		this.products = [];
		this.grass = [];
		this.id = 0;

		this.areaX = 355;
		this.areaY = 355;
		this.areaWidth = 765;
		this.areaHeight = 475;
		this.heightRatio = 1.3333333;

		this.gameFrame = 0;
		this.staggeredFrames = 3;
	}

	public moveHundler(event: MouseEvent, widthK: number, heightK: number) {
		this.products.forEach((item) => {
			const productCoords: Coords = {
				currentX: item.coordX / widthK,
				currentY: item.coordY / heightK,
				currentW: 48 * 2 / widthK,
				currentH: 48 * 2 / heightK
			};
			if (this.commonFunction.determineCoords(event, productCoords)) {
				item.isHover = true;
			} else
				item.isHover = false;
		});
		const animalsNow: string[] = [];
		this.animals.forEach((item) => {
			animalsNow.push(item.name);
		});
		return animalsNow;
	}

	public clickHundler(event: MouseEvent, widthK: number, heightK: number): string[] {
		const clickList: string[] = [];
		this.products.forEach((item, index, productList) => {
			if (item.state !== 'earth')
				return;
			const productCoords: Coords = {
				currentX: item.coordX / widthK,
				currentY: item.coordY / heightK,
				currentW: 48 * 2 / widthK,
				currentH: 48 * 2 / heightK
			};
			if (this.commonFunction.determineCoords(event, productCoords)) {
				this.music.productDone();
				clickList.push(item.name);
				item.state = 'fly';
				item.age = 0;
			}
		});

		this.animals.forEach((item, index, animalList) => {
			if (item.type !== 'bear')
				return;
			const bearCoords: Coords = {
				currentX: item.coordX / widthK,
				currentY: item.coordY / heightK,
				currentW: item.width * 2 / widthK,
				currentH: item.height * 2 / heightK
			};

			if (this.commonFunction.determineCoords(event, bearCoords)) {
				this.music.cageCreate();
				item.cageRemain = 0.5 * 60;
				if (item.cageBuild < 8)
					item.cageBuild++;
				if (item.cageBuild === 8 && item.state !== 'cage') {
					item.state = 'cage';
					item.frame = 0;
					item.cageRemain = 12 * 60;
				} else if (item.cageBuild === 8) {
					clickList.push('bear-1');
					item.state = 'fly';
					item.productAge = 0;

					item.wantX = 660;
					item.wantY = 945;
					item.speedX = (item.wantX - item.coordX) / (0.2 * 60);
					item.speedY = (item.wantY - item.coordY) / (0.2 * 60);
				}
				clickList.push('');
			}
		});
		return clickList;
	}

	public startLevel() {
		this.imagesPath.forEach(async (path) => {
			let animName = '';
			const anim = path.slice(path.lastIndexOf("/") + 1, -4);
			if (path.includes('pets')) {
				const petName = path.slice(12, 12 + path.slice(12).indexOf("/"));
				animName = petName + "-" + anim;
			} else if (path.includes('products')) {
				const productName = path.slice(16, 16 + path.slice(16).indexOf("/"));
				animName = productName + "-" + anim;
			} else {
				animName = anim;
			}
			this.images.set(animName, await this.commonFunction.loadImage(path));
		});
	}

	public renderLevel(curWidthK: number, curHeightK: number, isPaused: boolean) {
		const renderList: (AnimalList | Product | Grass)[] = [];
		this.products.forEach((item) => renderList.push(item));
		this.grass.forEach((item) => renderList.push(item));
		this.animals.forEach((item) => renderList.push(item));
		renderList.sort(this.sortCoord);

		renderList.forEach((item) => {
			if (item instanceof Product)
				this.renderProduct(item, curWidthK, curHeightK, isPaused);
			else if (item instanceof Grass)
				this.renderGrass(item, curWidthK, curHeightK, isPaused);
			else
				this.renderAnimal(item, curWidthK, curHeightK, isPaused);
		});

		// this.renderProducts(curWidthK, curHeightK);
		// this.renderGrass(curWidthK, curHeightK);
		// this.renderAnimals(curWidthK, curHeightK);
		if (!isPaused)
			this.gameFrame += 1;
	}

	private renderProduct(item: Product, curWidthK: number, curHeightK: number, isPaused: boolean) {
		this.context.restore(); // Перед каждой отрисовкой возращаем канвасу стандартные настройки прозрачности
		this.context.globalAlpha = 1;
		let animName = item.name;
		if (item.isHover)
			animName += '-hover';
		else
			animName += '-normal';
		const imageFile = this.images.get(animName) as HTMLImageElement;
		let sWidth = 48 * 2;
		let sHeight = 48 * 2;
		if (item.state === 'fly')
			sWidth = sHeight = 48 * (2 - item.age / 15);
		if (item.isBlinking && (this.gameFrame % 40) < 20)
			this.context.globalAlpha = 0.5;
		if (imageFile instanceof HTMLImageElement)
			this.context.drawImage(imageFile, 0, 0, 48, 48, item.coordX, item.coordY, sWidth, sHeight);

		if (item.state === 'fly') {
			item.age++;
			if (this.isNear(item.coordX, item.coordY, item.wantX, item.wantY, 100))
				this.products.splice(this.products.indexOf(item), 1);
			item.coordX += item.speedX;
			item.coordY += item.speedY;
			return;
		}

		if (!isPaused) {
			item.age++;
			if (item.age >= item.maxAge && (this.gameFrame % 40) < 20)
				this.products.splice(this.products.indexOf(item), 1);
			else if (item.age >= item.blinkAge)
				item.isBlinking = true;
		}
	}

	private renderGrass(item: Grass, curWidthK: number, curHeightK: number, isPaused: boolean) {
		this.context.restore(); // Перед каждой отрисовкой возращаем канвасу стандартные настройки прозрачности
		this.context.globalAlpha = 1;

		const frame = Math.min(item.age, item.maxAge);

		const imageFile = this.images.get("grass") as HTMLImageElement;
		const dx = 48 * (frame % 4);
		const dy = 48 * Math.floor(frame / 4);
		const sWidth = 48 * 2;
		const sHeight = 48 * 2;

		if (imageFile instanceof HTMLImageElement)
			this.context.drawImage(imageFile, dx, dy, 48, 48, item.coordX, item.coordY, sWidth, sHeight);

		if (!isPaused)
			item.age++;

		if (item.age % 180 == 0)
			item.isUsed = false;
	}


	private renderAnimal(item: AnimalList, curWidthK: number, curHeightK: number, isPaused: boolean) {
		this.context.restore();
		this.context.globalAlpha = 1;


		let animName = item.name + '-' + item.state;
		let imageFile = new Image();
		let dx = 0, dy = 0, dWidth = 0, dHeight = 0, sx = 0, sy = 0, sWidth = 0, sHeight = 0;

		if (item.state === 'death' && item.frame === 15 && item.opacity <= 0) {
			this.animals.splice(this.animals.indexOf(item), 1);
			return;
		} else if (item.state === 'death' && item.frame === 15) {
			this.context.globalAlpha = item.opacity;
			item.opacity -= 0.025;
		}

		if (item.state === 'shadow') {
			imageFile = this.images.get(animName) as HTMLImageElement;
			dx = 0;
			dy = 0;
			dWidth = item.shadowWidth;
			dHeight = item.shadowHeight;
			sx = item.coordX + item.width - item.shadowWidth;
			sy = item.fallY + item.height * 1.5 - item.shadowHeight;
			sWidth = dWidth * 2;
			sHeight = dHeight * 2;
			this.context.globalAlpha = item.opacity;
			this.drawImage(imageFile, dx, dy, dWidth, dHeight, sx, sy, sWidth, sHeight);

			animName = item.name + '-' + 'down';
			this.context.restore();
			this.context.globalAlpha = 1;
		}

		if (item.state === 'fly')
			animName = item.name + '-cage';
		imageFile = this.images.get(animName) as HTMLImageElement;
		dx = item.width * (item.frame % 4);
		dy = item.height * Math.floor(item.frame / 4);
		dWidth = item.width;
		dHeight = item.height;
		sx = item.coordX;
		sy = item.coordY;
		sWidth = dWidth * 2;
		sHeight = dHeight * 2;
		if (item.state === 'fly') {
			sWidth = dWidth * Math.max((2 - item.productAge / 12), 0.1);
			sHeight = dHeight * Math.max((2 - item.productAge / 12), 0.1);
		}

		const rotateK = 0.6;
		if (item.state === 'pic') {
			dx = dy = 0;
			sWidth -= rotateK * 2 * item.frame;
			sHeight -= rotateK * 2 * item.frame;
		}


		if (item.state === 'pic') {
			this.context.save();
			this.context.translate(item.coordX + (item.width - rotateK * item.frame), item.coordY + (item.height - rotateK * item.frame));
			this.context.rotate(item.rotate * Math.PI / 180);
			this.context.translate(-(item.coordX + (item.width - rotateK * item.frame)), -(item.coordY + (item.height - rotateK * item.frame)));
		}
		this.drawImage(imageFile, dx, dy, dWidth, dHeight, sx, sy, sWidth, sHeight);
		this.context.restore();

		if (item.state === 'pic') {
			item.frame += 3;
			item.rotate += 24;
			item.rotate %= 360;
			item.speedBoost = 10;
			if (item.wantX === 0)
				item.coordX -= item.speedBoost;
			else
				item.coordX += item.speedBoost;
			item.coordY -= item.speedBoost;
			item.state = 'pic';
			if (item.frame * rotateK - Math.min(item.width, item.height) > -5)
				this.animals.splice(this.animals.indexOf(item), 1);
			return;
		}

		if (item.state === 'shadow' && !isPaused) {
			if (item.type === 'bear') {
				if (item.coordY % 10 === 0)
					item.coordY = -15001;
				item.opacity += 0.005;
				item.opacity = Math.min(item.opacity, 1);
			} else
				item.opacity += 0.025;
			item.coordY += 50;
			if (item.coordY - item.fallY >= 0)
				item.state = 'down';
			return;
		} else if (item.state === 'shadow')
			return;

		if (item.state === 'death') {
			item = this.nextFrame(item, isPaused);
			return;
		}

		if (item.type === 'bear')
			this.renderBear(item, isPaused);
		else
			this.renderPet(item, isPaused);

	}

	private renderBear(item: Bear, isPaused: boolean) {
		let imageFile = new Image();
		let dx = 0, dy = 0, dWidth = 0, dHeight = 0, sx = 0, sy = 0, sWidth = 0, sHeight = 0;


		if (item.isEscape) {
			if (!isPaused) {
				item.speedBoost = 3;
				item = this.nextFrame(item, isPaused);
				item.speedBoost = 7;
				item = this.nextCoord(item);
			}
			if (item.coordX < -100 || item.coordX > 1600)
				this.animals.splice(this.animals.indexOf(item), 1);
			return;
		}

		imageFile = this.images.get("build-1") as HTMLImageElement;
		dx = 160 * (item.cageBuild % 3);
		dy = 160 * Math.floor(item.cageBuild / 3);
		dWidth = 160;
		dHeight = 160;
		sx = item.coordX - 160 / 6;
		sy = item.coordY - 160 / 5;
		sWidth = dWidth * 1.5;
		sHeight = dHeight * 1.5;
		if (item.state === 'fly') {
			sWidth = dWidth * Math.max((1.5 - item.productAge / 12), 0.1);
			sHeight = dHeight * Math.max((1.5 - item.productAge / 12), 0.1);
		}

		if (item.state === 'cage' && item.cageRemain <= 3 * 60) {
			dx = 160 * (item.frame % 3);
			dy = 160 * Math.floor(item.frame / 3);
			imageFile = this.images.get("break-1") as HTMLImageElement;
		}

		this.drawImage(imageFile, dx, dy, dWidth, dHeight, sx, sy, sWidth, sHeight);

		if (isPaused)
			return;

		if (item.state === 'fly') {
			item.productAge++;
			if (this.isNear(item.coordX, item.coordY, item.wantX, item.wantY, 250))
				this.animals.splice(this.animals.indexOf(item), 1);
			item.coordX += item.speedX;
			item.coordY += item.speedY;
			return;
		}

		if (item.state === 'cage') {
			if (item.cageRemain <= 0) {
				this.music.cageBroke();
				item.isEscape = true;
				item.wantY = item.coordY;
				if (item.coordX + item.width / 2 < 800) {
					item.state = 'left';
					item.wantX = -200;
				} else {
					item.state = 'right';
					item.wantX = 1800;
				}
				return;
			} else if (item.cageRemain <= 3 * 60)
				item = this.nextFrame(item, isPaused);
			item.cageRemain--;
			return;
		}

		if (item.cageBuild > 0) {
			if (item.cageRemain <= 0) {
				item.cageBuild--;
				item.cageRemain = 2 * 60;
			}
			item.cageRemain--;
		}


		item.speedBoost = 1.4 - item.cageBuild / 10;
		item = this.nextFrame(item, isPaused);

		if (this.isNear(item.coordX, item.coordY, item.wantX, item.wantY)) {
			while (this.isNear(item.coordX, item.coordY, item.wantX, item.wantY, 100)) {
				item.wantX = this.areaX + Math.floor(Math.random() * this.areaWidth);
				item.wantY = this.areaY + Math.floor(Math.random() * this.areaHeight);
			}
		}

		item.speedBoost = 0.6 - item.cageBuild / 16;
		item = this.nextCoord(item);
		this.animals.forEach((pet) => {
			if (pet.type !== "pet" || pet.state === 'shadow')
				return;
			const bearCollision = 60;
			if (this.isBearNear(pet.coordX, pet.coordY, pet.width, pet.height, item.coordX, item.coordY, item.width, item.height, bearCollision) <= 0)
				this.petAway(pet);
		});
	}

	private renderPet(item: AnimalList, isPaused: boolean) {
		let imageFile = new Image();
		let dx = 0, dy = 0, dWidth = 0, dHeight = 0, sx = 0, sy = 0, sWidth = 0, sHeight = 0;

		item = this.nextFrame(item, isPaused);

		if (item.productAge >= item.productNeed && (((Math.floor(Math.random() * 100)) + 1) === 100)) {
			this.createProduct(item.productName, item.coordX, item.coordY);
			item.productAge = 0;
		}

		let hungryPercent = (item.food - item.lastEat) / item.food;

		if (item.lastEat < item.food) {
			imageFile = this.images.get("hungerBar") as HTMLImageElement;
			dx = 0, dy = 0;
			dWidth = Math.floor(40 * hungryPercent);
			dHeight = 8;
			sx = item.coordX + item.width - 40;
			sy = item.coordY + item.height * 1.5 + 8;
			sWidth = dWidth * 2;
			sHeight = dHeight * 2;

			this.drawImage(imageFile, dx, dy, dWidth, dHeight, sx, sy, sWidth, sHeight);
		}

		if (isPaused)
			return;

		if (hungryPercent <= 0) {
			// умирание курицы
			if (item.name === 'chicken') {
				this.music.chickenDie();
			} else {
				this.music.pigDie();
			}

			item.state = "death";
			item.frame = 0;
			return;
		} else if (hungryPercent <= 0.38) {
			if (!item.isWantGrass && this.grass.length > 0) {
				const grassIndex = this.findGrass(item);
				if (grassIndex !== -1) {
					this.grass[grassIndex].isUsed = true;
					item.isWantGrass = true;
				}
			}
			item.speedBoost = 2;
		}

		if (this.isNear(item.coordX, item.coordY, item.wantX, item.wantY)) {
			if (item.isWantGrass) { // Если пришёл поесть
				if (!item.state.includes('eat')) {
					if (item.state.includes("left"))
						item.state = "eat-left";
					else
						item.state = "eat-right";
					item.frame = 0;
				} else if (item.frame === item.frameNum - 1) {
					item.state = item.state.slice(4, item.state.length);
					item.lastEat -= item.food * 0.4;

					const grassIndex = this.findGrass(item);
					this.grass.splice(grassIndex, 1);
					item.isWantGrass = false;

					hungryPercent = (item.food - item.lastEat) / item.food;
					if (hungryPercent <= 0.95) {
						const grassIndex = this.findGrass(item);
						if (grassIndex !== -1) {
							this.grass[grassIndex].isUsed = true;
							item.isWantGrass = true;
						}
						item.speedBoost = 2;
					}
				}
			} else {
				while (this.isNear(item.coordX, item.coordY, item.wantX, item.wantY, 50)) {
					item.wantX = this.areaX + Math.floor(Math.random() * this.areaWidth);
					item.wantY = this.areaY + Math.floor(Math.random() * this.areaHeight);
				}
			}
		}

		item = this.nextCoord(item);
	}

	private drawImage(imageFile: HTMLImageElement, dx: number, dy: number, dWidth: number, dHeight: number, sx: number, sy: number, sWidth: number, sHeight: number): void {
		if (imageFile instanceof HTMLImageElement)
			this.context.drawImage(imageFile, dx, dy, dWidth, dHeight, sx, sy, sWidth, sHeight);
	}

	private nextFrame(item: AnimalList, isPaused: boolean) {
		if (!isPaused) {
			item.productAge++;
			if (!item.state.includes('eat'))
				item.lastEat++;
			if (item.state !== "death" || item.frame !== 15) {
				let frameK = item.speedBoost;
				if (item.state === 'death' || item.state.includes('eat'))
					frameK = 0.5;

				if (this.gameFrame % Math.ceil(this.staggeredFrames / frameK) === 0)
					item.frame = (item.frame + 1) % item.frameNum;
				// eslint-disable-next-line no-dupe-else-if
				else if (this.gameFrame % Math.ceil(this.staggeredFrames / frameK) === 0)
					item.frame = (item.frame + 1) % item.frameNum;
			}
		}
		item.speedBoost = 1;
		return item;
	}

	private nextCoord(item: AnimalList) {
		if (!item.state.includes("eat")) {
			let state = '';

			if (item.coordY - item.wantY < -2)
				state = 'down';
			else if (item.coordY - item.wantY > 2)
				state = 'up';

			if (item.coordX - item.wantX < -2)
				state += (state.length > 0 ? '-' : '') + 'right';
			else if (item.coordX - item.wantX > 2)
				state += (state.length > 0 ? '-' : '') + 'left';

			switch (state) {
				case 'down':
					item.coordY += 1.75 * item.speedBoost;
					break;
				case 'down-right':
					item.coordY += 1.25 * item.speedBoost;
					item.coordX += 1.25 * item.speedBoost;
					break;
				case 'down-left':
					item.coordY += 1.25 * item.speedBoost;
					item.coordX -= 1.25 * item.speedBoost;
					break;
				case 'up':
					item.coordY -= 1.75 * item.speedBoost;
					break;
				case 'up-right':
					item.coordY -= 1.25 * item.speedBoost;
					item.coordX += 1.25 * item.speedBoost;
					break;
				case 'up-left':
					item.coordY -= 1.25 * item.speedBoost;
					item.coordX -= 1.25 * item.speedBoost;
					break;
				case 'right':
					item.coordX += 1.75 * item.speedBoost;
					break;
				case 'left':
					item.coordX -= 1.75 * item.speedBoost;
					break;
			}
			if (state !== '')
				item.state = state;
		}
		return item;
	}

	private isNear(x1: number, y1: number, x2: number, y2: number, collision = 10): boolean {
		return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2) <= collision;
	}

	private isBearNear(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number, collision = 10) {
		const cx1 = x1 + Math.trunc(w1 / 2);
		const cy1 = y1 + Math.trunc(h1 / 2);
		const cx2 = x2 + Math.trunc(w2 / 2);
		const cy2 = y2 + Math.trunc(h2 / 2);

		const d1 = Math.abs(cx1 - cx2);
		const d2 = Math.abs(cy1 - cy2);

		let dist = -1;

		if ((d1 - collision < ((w1 + w2) / 2) && (d2 + collision >= ((h1 + h2) / 2)))) {
			dist = Math.max(1, d2 - ((h1 + h2) / 2));
		} else if ((d1 + collision >= ((w1 + w2) / 2)) && (d2 - collision < ((h1 + h2) / 2))) {
			dist = Math.max(d1 - ((w1 + w2) / 2));
		} else if ((d1 + collision >= ((w1 + w2) / 2)) && (d2 + collision >= ((h1 + h2) / 2))) {
			const deltaX = d1 - ((w1 + w2) / 2);
			const deltaY = d2 - ((h1 + h2) / 2);
			dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		}

		return dist;
	}

	private findGrass(item: AnimalList) {
		let now = 100000, grassIndex = -1;
		this.grass.forEach((grass, index) => {
			if (!grass.isUsed && (grass.coordX - item.coordX) * (grass.coordX - item.coordX) + (grass.coordY - item.coordY) * (grass.coordY - item.coordY) < now) {
				now = (grass.coordX - item.coordX) * (grass.coordX - item.coordX) + (grass.coordY - item.coordY) * (grass.coordY - item.coordY);
				item.wantX = grass.coordX;
				item.wantY = grass.coordY;
				grassIndex = index;
			}
		});
		return grassIndex;
	}

	private petAway(item: AnimalList) {
		if (item.name === 'chicken') {
			this.music.chickenFly();
		} else {
			this.music.pigFly();
		}

		item.state = 'pic';
		if (item.coordX + item.width / 2 < 800)
			item.wantX = 0;
		else
			item.wantX = 1600;
		item.frame = 0;
	}

	public createAnimal(name: string) {
		if (!(typeof this.id !== "number"))
			this.id = 0;
		if (name === "chicken") {
			this.music.onChicken();
			this.animals.push(new Chicken(this.id, this.areaX + Math.floor(Math.random() * this.areaWidth), this.areaY + Math.floor(Math.random() * this.areaHeight)));
		}
		if (name === "pig") {
			this.music.onPig();
			this.animals.push(new Pig(this.id, this.areaX + Math.floor(Math.random() * this.areaWidth), this.areaY + Math.floor(Math.random() * this.areaHeight)));
		} if (name === "bear") {
			// this.music.bearAppiarance();
			this.animals.push(new Bear(this.id, this.areaX + Math.floor(Math.random() * this.areaWidth), this.areaY + Math.floor(Math.random() * this.areaHeight), 0));

		}
		this.id++;
	}

	public createGrass(clickX: number, clickY: number, widthK: number, heightK: number) {
		clickX -= 24 * widthK; clickY -= 24 * heightK;

		const k = 42; //отступ между травами
		if (clickX - k * 2 >= this.areaX)
			this.grass.push(new Grass(clickX - k * 2, clickY, Math.floor(Math.random() * 5) + 3));
		if (clickX - k >= this.areaX && clickY + k <= this.areaY + this.areaHeight)
			this.grass.push(new Grass(clickX - k, clickY + k, Math.floor(Math.random() * 5) + 3));
		if (clickY + k * 2 <= this.areaY + this.areaHeight)
			this.grass.push(new Grass(clickX, clickY + k * 2, Math.floor(Math.random() * 5) + 3));
		if (clickX + k <= this.areaX + this.areaWidth && clickY + k <= this.areaY + this.areaHeight)
			this.grass.push(new Grass(clickX + k, clickY + k, Math.floor(Math.random() * 5) + 3));
		if (clickX + k <= this.areaX + this.areaWidth)
			this.grass.push(new Grass(clickX + k * 2, clickY, Math.floor(Math.random() * 5) + 3));
		if (clickX - k >= this.areaX && clickY - k >= this.areaX)
			this.grass.push(new Grass(clickX - k, clickY - k, Math.floor(Math.random() * 5) + 3));
		if (clickY - k * 2 >= this.areaY)
			this.grass.push(new Grass(clickX, clickY - k * 2, Math.floor(Math.random() * 5) + 3));
		if (clickX + k <= this.areaX + this.areaWidth && clickY - k >= this.areaX)
			this.grass.push(new Grass(clickX + k, clickY - k, Math.floor(Math.random() * 5) + 3));

		if (clickX - k >= this.areaX)
			this.grass.push(new Grass(clickX - k, clickY, Math.floor(Math.random() * 5) + 7));
		if (clickY + k <= this.areaY + this.areaHeight)
			this.grass.push(new Grass(clickX, clickY + k, Math.floor(Math.random() * 5) + 7));
		if (clickX + k <= this.areaX + this.areaWidth)
			this.grass.push(new Grass(clickX + k, clickY, Math.floor(Math.random() * 5) + 7));
		if (clickY + k <= this.areaY + this.areaHeight)
			this.grass.push(new Grass(clickX, clickY - k, Math.floor(Math.random() * 5) + 7));

		this.grass.push(new Grass(clickX, clickY, Math.floor(Math.random() * 4) + 12));
	}

	public createProduct(name: string, coordX: number, coordY: number) {
		this.products.push(new Product(name, coordX, coordY));
	}

	protected sortCoord(a: AnimalList | Product | Grass, b: AnimalList | Product | Grass): number {
		let aY = a.coordY, bY = b.coordY;
		const grassK = 2.25, productK = 1.75; // Нужен для правильного баланса между животными и остальным
		const animalsK: { [key: string]: number } = {
			'chicken': 1,
			'pig': 0.1,
			'bear-panda': 0.1,
		};
		if (a instanceof Grass)
			aY -= 48 * grassK;
		else if (a instanceof Product)
			aY -= 48 * productK;
		else
			aY -= a.height * animalsK[a.name];
		if (b instanceof Grass)
			bY -= 48 * grassK;
		else if (b instanceof Product)
			bY -= 48 * productK;
		else
			bY -= b.height * animalsK[b.name];
		return aY - bY;
	}
}