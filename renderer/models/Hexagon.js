export default class Hexagon {
    center;
    size;
    hexaPoints = [];
    edgePoints = [];
    active = false;
    index = 0;
    pin = [];
    r;

    constructor(center, size, index, pin) {
        this.center = center;
        this.size = size;
        this.index = index;
        this.pin = pin;
        this.createPoints();
    }

    createPoints() {
        let x = this.center[0];
        let y = this.center[1];
        const a = this.size / 2;
        const b = (3 / 4) * a;
        const r = a * (Math.sqrt(3) / 2);
        this.r = r;
        this.hexaPoints.push([x+a/2, y+r], [x+a, y], [x+a/2, y-r], [x-a/2, y-r], [x-a, y], [x-a/2, y+r]);
        this.edgePoints.push([x, y+r], [x+b, y+r/2], [x+b, y-r/2], [x, y-r], [x-b, y-r/2], [x-b, y+r/2]);
    }
}