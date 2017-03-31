/**
 * Point in 3-dimensional space.
 * @class
 * @param {Number} x - x value of point. Defaults to 0.
 * @param {Number} y - y value of point. Defaults to 0.
 * @param {Number} z - z value of point. Defaults to 0.
 */
function Point(x = 0, y = 0, z = 0) {
  this.pt = [x, y, z];
}

/**
 * Set or get the point's x value.
 * @param {Number|Null} x - x value
 * @returns {Number|Point} If no value given, returns the x value.
 * Otherwise returns the Point object.
 */
Point.prototype.x = function x(_x) {
  if (_x == null) return this.pt[0];
  this.pt[0] = _x;
  return this;
};

/**
 * Move the Point in the x direction relative to its current position.
 * @param {Number} dx - Distance by which to move the Point's x value.
 * @returns {Point} The point object.
 */
Point.prototype.moveX = function moveX(dx) {
  this.pt[0] += dx;
  return this;
};

Point.prototype.y = function y(_y) {
  if (_y == null) return this.pt[1];
  this.pt[1] = _y;
  return this;
};

/**
 * Move the Point in the y direction relative to its current position.
 * @param {Number} dy - Distance by which to move the Point's y value.
 * @returns {Point} The point object.
 */
Point.prototype.moveY = function moveY(dy) {
  this.pt[1] += dy;
  return this;
};

Point.prototype.z = function z(_z) {
  if (_z == null) return this.pt[2];
  this.pt[2] = _z;
  return this;
};

/**
 * Move the Point in the z direction relative to its current position.
 * @param {Number} dz - Distance by which to move the Point's z value.
 * @returns {Point} The point object.
 */
Point.prototype.moveZ = function moveZ(dz) {
  this.pt[2] += dz;
  return this;
};

/**
 * Multiply the point by a scalar value s (i.e. scale its position relative to the origin by s).
 * @param {Number} s - Amount by which to scale the point.
 * @returns {Point} A new Point object with the updated position.
 */
Point.prototype.multiply = function multiply(s) {
  return new Point(this.pt[0] * s, this.pt[1] * s, this.pt[2] * s);
};

/**
 * Add the positions of two Points.
 * @param {Point} pt - The Point to add to the current one.
 * @returns {Point} A new Point object with the updated position.
 */
Point.prototype.add = function add(pt) {
  return new Point(
    this.pt[0] + pt.pt[0],
    this.pt[1] + pt.pt[1],
    this.pt[2] + pt.pt[2],
  );
};

/**
 * In-place rotation of Point in x-y space (i.e. about z axis).
 * @param {Number} deg - Number of degrees by which to rotate.
 * @returns {Point} The original Point object with rotated position.
 */
Point.prototype.rotateXY = function rotateXY(deg) {
  const x = this.x();
  const y = this.y();
  const c = Math.cos((deg * Math.PI) / 180);
  const s = Math.sin((deg * Math.PI) / 180);

  const nx = (c * x) - (s * y);
  const ny = (s * x) + (c * y);

  this.x(nx);
  this.y(ny);

  return this;
};

/**
 * In-place rotation of Point in y-z space (i.e. about x axis).
 * @param {Number} deg - Number of degrees by which to rotate.
 * @returns {Point} The original Point object with rotated position.
 */
Point.prototype.rotateYZ = function rotateYZ(deg) {
  const y = this.y();
  const z = this.z();
  const c = Math.cos((deg * Math.PI) / 180);
  const s = Math.sin((deg * Math.PI) / 180);

  const ny = (c * y) - (s * z);
  const nz = (s * y) + (c * z);

  this.y(ny);
  this.z(nz);

  return this;
};

export default Point;
