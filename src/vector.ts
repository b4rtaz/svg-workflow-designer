
export class Vector {

	public constructor(
		public readonly x: number,
		public readonly y: number) {
	}

	public add(v: Vector): Vector {
		return new Vector(this.x + v.x, this.y + v.y);
	}

	public subtract(v: Vector): Vector {
		return new Vector(this.x - v.x, this.y - v.y);
	}

	public multiplyConst(v: number): Vector {
		return new Vector(this.x * v, this.y * v);
	}

	public divideConst(v: number): Vector {
		return new Vector(this.x / v, this.y / v);
	}

	public round(): Vector {
		return new Vector(Math.round(this.x), Math.round(this.y));
	}

	public distance(v: Vector): number {
		return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
	}

	public angleRad(v: Vector): number {
		return Math.atan2(this.y - v.y, this.x - v.x) * (180 / Math.PI);
	}
}
