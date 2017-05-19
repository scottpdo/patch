// @flow

import Point from './Point';

/**
 * A curve defined by 4 control points.
 * Parameters can be 4 points or an Array of length 4
 * containing 4 points.
 * @class
 * @param {Point|Array} p0 - The starting Point or an Array containing
 * the four Points.
 * @param {Point|Null} p1 - The 1st control Point (or nothing if p0 was an
 * Array).
 * @param {Point|Null} p2 - The 2nd control Point (or nothing if p0 was an
 * Array).
 * @param {Point|Null} p3 - The end Point (or nothing if p0 was an Array).
 */
class Bezier {

  p0: Point;
  p1: Point;
  p2: Point;
  p3: Point;

  constructor(p0: Point, p1: Point, p2: Point, p3: Point) {
    if (p0 instanceof Array) {
      p0.forEach((pt, i) => {
        const num = "p" + i;
        // $FlowIgnore
        this[num] = pt;
      });
    } else {
      this.p0 = p0;
      this.p1 = p1;
      this.p2 = p2;
      this.p3 = p3;
    }
  }

  /**
   * Evaluate a curve at parameter t, 0-1.
   * @param {Number} t - t between 0 and 1 (inclusive).
   * @returns {Point} The point on the curve at parameter t.
   */
  evaluate(t: number): Point {
    if (t < 0 || t > 1) {
      console.error("Curve parameter out of bounds: ", t);
      throw new Error("Can't evaluate this curve.");
    }

    const it = 1 - t;
    const p0 = this.p0; const p1 = this.p1;
    const p2 = this.p2; const p3 = this.p3;

    let pt = new Point();

    pt = pt.add(p0.multiply(it * it * it))
      .add(p1.multiply(3 * it * it * t))
      .add(p2.multiply(3 * it * t * t))
      .add(p3.multiply(t * t * t));

    return pt;
  }

  derivate(t: number): Point {
    if (t < 0 || t > 1) throw new Error("Can't evaluate this curve.");

    const it = 1 - t;
    const p0 = this.p0; const p1 = this.p1;
    const p2 = this.p2; const p3 = this.p3;

    let pt = new Point();

    pt = pt.add(p1.subtract(p0).multiply(3 * it * it))
      .add(p2.subtract(p1).multiply(6 * it * t))
      .add(p3.subtract(p2).multiply(3 * t * t));

    return pt;
  }

  /**
   * Given a start parameter and end parameter, trim the existing curve
   * and return a new curve (with end- and control points) parameterized
   * from 0 to 1 at these points.
   */
  trim(start: number, end: number): Bezier {

    if (arguments.length !== 2) {
      throw new Error("Need a start and end to trim a curve.");
    }

    if (start < 0 || start > 1 || end < 0 || end > 1) {
      throw new Error("Can't trim this curve.");
    }

    // Endpoints: just evaluate at given params
    let p0 = this.evaluate(start);
    let p3 = this.evaluate(end);

    // Need to calculate derivatives at these new endpoints
    let dp0 = this.derivate(start);
    let dp3 = this.derivate(end);

    // Calculate new control points from the given endpoints
    // and derivatives
    let p1 = p0.multiply(3).add(dp0).multiply(1 / 3);
    let p2 = p3.multiply(3).subtract(dp3).multiply(1 / 3);

    // Create a new curve and assign end- and control points
    let b = new Bezier();
    b.p0 = p0; b.p1 = p1; b.p2 = p2; b.p3 = p3;

    return b;
  }

  distance(curve: Bezier): number {
    let d = 0;
    ["p0", "p1", "p2", "p3"].forEach((pt) => {
      d += this[pt].distance(curve[pt]);
    });
    return d;
  }

  /*
   *  In-place moving toward another Bezier.
   */
  moveToward(curve: Bezier, d: number): Bezier {
    ["p0", "p1", "p2", "p3"].forEach((pt) => {
      this[pt].moveToward(curve[pt], d);
    });
  }

  /*
   *  Linearly interpolate between this and another curve.
   */
  lerp(curve: Bezier, d: number): Bezier {
    return new Bezier(
      this.p0.lerp(curve.p0, d),
      this.p1.lerp(curve.p1, d),
      this.p2.lerp(curve.p2, d),
      this.p3.lerp(curve.p3, d),
    );
  }

  getInfo() {
    return {
      endpoints: this.p0.toArray().join(', ') + " ... " + this.p3.toArray().join(', ')
    };
  }
}

export default Bezier;
