/**
 * Point in 3-dimensional space.
 * @class
 * @param {Number} x - x value of point. Defaults to 0.
 * @param {Number} y - y value of point. Defaults to 0.
 * @param {Number} z - z value of point. Defaults to 0.
 */
function Point(x = 0, y = 0, z = 0) {
    this.pt = [x, y, z];
};

/**
 * Set or get the point's x value.
 * @param {Number|Null} x - x value
 * @returns {Number|Point} If no value given, returns the x value. Otherwise returns the Point object.
 */
Point.prototype.x = function(x) {
    if (x == null) return this.pt[0];
    this.pt[0] = x;
    return this;
};

/**
 * Move the Point in the x direction relative to its current position.
 * @param {Number} dx - Distance by which to move the Point's x value.
 * @returns {Point} The point object.
 */
Point.prototype.moveX = function(dx) {
    this.pt[0] += dx;
    return this;
};

Point.prototype.y = function(y) {
    if (y == null) return this.pt[1];
    this.pt[1] = y;
    return this;
};

/**
 * Move the Point in the y direction relative to its current position.
 * @param {Number} dy - Distance by which to move the Point's y value.
 * @returns {Point} The point object.
 */
Point.prototype.moveY = function(dy) {
    this.pt[1] += dy;
    return this;
};

Point.prototype.z = function(z) {
    if (z == null) return this.pt[2];
    this.pt[2] = z;
    return this;
};

/**
 * Move the Point in the z direction relative to its current position.
 * @param {Number} dz - Distance by which to move the Point's z value.
 * @returns {Point} The point object.
 */
Point.prototype.moveZ = function(dz) {
    this.pt[2] += dz;
    return this;
};

/**
 * Multiply the point by a scalar value s (i.e. scale its position relative to the origin by s).
 * @param {Number} s - Amount by which to scale the point.
 * @returns {Point} A new Point object with the updated position.
 */
Point.prototype.multiply = function(s) {
    return new Point(this.pt[0] * s, this.pt[1] * s, this.pt[2] * s);
};

/**
 * Add the positions of two Points.
 * @param {Point} pt - The Point to add to the current one.
 * @returns {Point} A new Point object with the updated position.
 */
Point.prototype.add = function(pt) {
    return new Point(
        this.pt[0] + pt.pt[0],
        this.pt[1] + pt.pt[1],
        this.pt[2] + pt.pt[2]
    );
};

/**
 * In-place rotation of Point in x-y space (i.e. about z axis).
 * @param {Number} deg - Number of degrees by which to rotate.
 * @returns {Point} The original Point object with rotated position.
 */
Point.prototype.rotate = function(deg) {

    let x = this.x(),
        y = this.y(),
        c = Math.cos(deg * Math.PI / 180),
        s = Math.sin(deg * Math.PI / 180);

    let nx = c * x - s * y;
    let ny = s * x + c * y;

    this.x(nx);
    this.y(ny);

    return this;
};

export default Point;
