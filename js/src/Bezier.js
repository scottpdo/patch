import Point from './Point';

let Bezier = function(p0, p1, p2, p3) {

    this.p0 = p0;
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;

    this.type = 'cubic';
    if (!p2) this.type = 'linear';
    else if (!p3) this.type = 'quadratic';

};

Bezier.prototype.evaluate = function(t) {

    if (t < 0 || t > 1) throw new Error("Can't evaluate this curve.");

    let it = 1 - t;

    if (this.type == 'cubic') {

        return new Point(0, 0, 0)
            .add(this.p0.multiply(it * it * it))
            .add(this.p1.multiply(3 * it * it * t))
            .add(this.p2.multiply(3 * it * t * t))
            .add(this.p3.multiply(t * t * t));

    } else if (this.type == 'linear') {

        return new Point(0, 0, 0)
            .add(this.p0.multiply(it))
            .add(this.p1.multiply(t));

    } else if (this.type == 'quadratic') {

        return new Point(0, 0, 0)
            .add(this.p0.multiply(it * it))
            .add(this.p1.multiply(2 * it * t))
            .add(this.p2.multiply(t * t));

    }
};

Bezier.prototype.pt0 = function(pt) {
    if (!pt) return this.p0;
    this.p0 = pt;
    return this;
};

Bezier.prototype.pt1 = function(pt) {
    if (!pt) return this.p1;
    this.p1 = pt;
    return this;
};

Bezier.prototype.pt2 = function(pt) {
    if (!pt) return this.p2;
    this.p2 = pt;
    return this;
};

Bezier.prototype.pt3 = function(pt) {
    if (!pt) return this.p3;
    this.p3 = pt;
    return this;
};

export default Bezier;