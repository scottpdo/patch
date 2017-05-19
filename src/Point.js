/**
 * Point in 3-dimensional space.
 * @class
 * @param {Number} x - x value of point. Defaults to 0.
 * @param {Number} y - y value of point. Defaults to 0.
 * @param {Number} z - z value of point. Defaults to 0.
 */
class Point {

  pt: Array;

  constructor(x = 0, y = 0, z = 0) {

    if (x instanceof Array) {
      this.pt = x;
      return;
    }
    this.pt = [x, y, z];
  }

  /**
   * Set or get the point's x value.
   * @param {Number|Null} x - x value
   * @returns {Number|Point} If no value given, returns the x value.
   * Otherwise returns the Point object.
   */
  x(_x) {
    if (_x == null) return this.pt[0];
    this.pt[0] = _x;
    return this;
  }

  /**
   * Move the Point in the x direction relative to its current position.
   * @param {Number} dx - Distance by which to move the Point's x value.
   * @returns {Point} The point object.
   */
  moveX(dx) {
    this.pt[0] += dx;
    return this;
  }

  /**
   * Set or get the point's y value.
   * @param {Number|Null} y - y value
   * @returns {Number|Point} If no value given, returns the y value.
   * Otherwise returns the Point object.
   */
  y(_y) {
    if (_y == null) return this.pt[1];
    this.pt[1] = _y;
    return this;
  }

  /**
   * Move the Point in the y direction relative to its current position.
   * @param {Number} dy - Distance by which to move the Point's y value.
   * @returns {Point} The point object.
   */
  moveY(dy) {
    this.pt[1] += dy;
    return this;
  }

  /**
   * Set or get the point's z value.
   * @param {Number|Null} z - z value
   * @returns {Number|Point} If no value given, returns the z value.
   * Otherwise returns the Point object.
   */
  z(_z) {
    if (_z == null) return this.pt[2];
    this.pt[2] = _z;
    return this;
  }

  /**
   * Move the Point in the z direction relative to its current position.
   * @param {Number} dz - Distance by which to move the Point's z value.
   * @returns {Point} The point object.
   */
  moveZ(dz) {
    this.pt[2] += dz;
    return this;
  }

  /**
   * Multiply the point by a scalar value s (i.e. scale its position relative to the origin by s).
   * @param {Number} s - Amount by which to scale the point.
   * @returns {Point} A new Point object with the updated position.
   */
  multiply(s) {
    return new Point(this.x() * s, this.y() * s, this.z() * s);
  }

  inv() {
    return this.multiply(-1);
  }

  /**
   * Add the positions of two Points.
   * @param {Point} pt - The Point to add to the current one.
   * @returns {Point} A new Point object with the updated position.
   */
  add(pt: Point): Point {
    return new Point(
      this.x() + pt.x(),
      this.y() + pt.y(),
      this.z() + pt.z(),
    );
  }

  subtract(pt) {
    return this.add(pt.inv());
  }

  /**
   * In-place rotation of Point in x-y space (i.e. about z axis).
   * @param {Number} deg - Number of degrees by which to rotate.
   * @returns {Point} The original Point object with rotated position.
   */
  rotateXY(deg) {
    const x = this.x();
    const y = this.y();
    const c = Math.cos((deg * Math.PI) / 180);
    const s = Math.sin((deg * Math.PI) / 180);

    const nx = (c * x) - (s * y);
    const ny = (s * x) + (c * y);

    this.x(nx);
    this.y(ny);

    return this;
  }

  /**
   * In-place rotation of Point in y-z space (i.e. about x axis).
   * @param {Number} deg - Number of degrees by which to rotate.
   * @returns {Point} The original Point object with rotated position.
   */
  rotateXZ(deg) {
    const x = this.x();
    const z = this.z();
    const c = Math.cos((deg * Math.PI) / 180);
    const s = Math.sin((deg * Math.PI) / 180);

    const nx = (c * x) - (s * z);
    const nz = (s * x) + (c * z);

    this.x(nx);
    this.z(nz);

    return this;
  }

  /**
   * In-place rotation of Point in y-z space (i.e. about x axis).
   * @param {Number} deg - Number of degrees by which to rotate.
   * @returns {Point} The original Point object with rotated position.
   */
  rotateYZ(deg) {
    const y = this.y();
    const z = this.z();
    const c = Math.cos((deg * Math.PI) / 180);
    const s = Math.sin((deg * Math.PI) / 180);

    const ny = (c * y) - (s * z);
    const nz = (s * y) + (c * z);

    this.y(ny);
    this.z(nz);

    return this;
  }

  /**
   * Retrieve the point's position as an Array of length 3.
   * @returns {Array} [x value, y value, z value]
   */
  toArray(): Array<number> {
    return this.pt;
  }

  distance(pt: Point): number {
    const dx = this.x() - pt.x();
    const dy = this.y() - pt.y();
    const dz = this.z() - pt.z();
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * In-place moving toward another Point.
   */
  moveToward(pt: Point, d: number): Point {
    const dx = d * (pt.x() - this.x());
    const dy = d * (pt.y() - this.y());
    const dz = d * (pt.z() - this.z());
    this.moveX(dx); this.moveY(dy); this.moveZ(dz);
  }

  /*
   * Linear interpolation toward another Point.
   */
  lerp(pt: Point, d: number): Point {
    return new Point(
      this.x() * (1 - d) + pt.x() * d,
      this.y() * (1 - d) + pt.y() * d,
      this.z() * (1 - d) + pt.z() * d,
    );
  }

  set(pt: Point) {
    this.x(pt.x());
    this.y(pt.y());
    this.z(pt.z());
  }

  clone() {
    return new Point(this.x(), this.y(), this.z());
  }
}

export default Point;
