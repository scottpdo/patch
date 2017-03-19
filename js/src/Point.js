let Point = function(x, y, z) {
    this.pt = [x, y, z];
};

Point.prototype.x = function(x) {
    if (!x) return this.pt[0];
    this.pt[0] = x;
    return this;
};

Point.prototype.moveX = function(dx) {
    this.pt[0] += dx;
    return this;
};

Point.prototype.y = function(y) {
    if (!y) return this.pt[1];
    this.pt[1] = y;
    return this;
};

Point.prototype.moveY = function(dy) {
    this.pt[1] += dy;
    return this;
};

Point.prototype.z = function(z) {
    if (!z) return this.pt[2];
    this.pt[2] = z;
    return this;
};

Point.prototype.moveZ = function(dz) {
    this.pt[2] += dz;
    return this;
};

Point.prototype.multiply = function(s) {
    return new Point(this.pt[0] * s, this.pt[1] * s, this.pt[2] * s);
};

Point.prototype.add = function(pt) {
    return new Point(
        this.pt[0] + pt.pt[0],
        this.pt[1] + pt.pt[1],
        this.pt[2] + pt.pt[2]
    );
};

export default Point;
