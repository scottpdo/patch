// @flow

import Point from './Point';
import Bezier from './Bezier';

/*
 * A patched surface from four boundary Bezier curves.
 */
class Surface {

  u0: Bezier;
  u1: Bezier;
  v0: Bezier;
  v1: Bezier;

  constructor(u0: Bezier, u1: Bezier, v0: Bezier, v1: Bezier) {

    this.u0 = u0;
    this.u1 = u1;
    this.v0 = v0;
    this.v1 = v1;

  }

  /**
   * Evaluate a pair of u/v coordinates on the surface, returning
   * a `Point` in world space.
   * @param {Number} u The u parameter, between 0 and 1 (inclusive).
   * @param {Number} v The v parameter, between 0 and 1 (inclusive).
   * @returns {Point} The `Point` on the surface (in world space).
   */
  patch(u: number, v: number): Point {

    const u0 = this.u0;
    const u1 = this.u1;
    const v0 = this.v0;
    const v1 = this.v1;

    const Lu = u0.evaluate(u).multiply(1 - v).add(u1.evaluate(u).multiply(v));
    const Lv = v0.evaluate(v).multiply(1 - u).add(v1.evaluate(v).multiply(u));
    const B = u0.evaluate(0).multiply((1 - u) * (1 - v))
            .add(u0.evaluate(1).multiply(u * (1 - v)))
            .add(u1.evaluate(0).multiply((1 - u) * v))
            .add(u1.evaluate(1).multiply(u * v));

    const C = Lu.add(Lv).add(B.multiply(-1));

    return C;
  }

  /**
   * Updates a point on a boundary curve, maintaining endpoint constraints
   * on neighboring curves.
   */
  updatePt(curve: string, param: string, pt: Point): void {

    // $FlowIgnore
    this[curve][param] = pt;

    if (curve === "u0") {
      if (param === "p0") this.v0.p0 = pt;
      if (param === "p3") this.v1.p0 = pt;
    } else if (curve === "v0") {
      if (param === "p0") this.u0.p0 = pt;
      if (param === "p3") this.u1.p0 = pt;
    } else if (curve === "u1") {
      if (param === "p0") this.v0.p3 = pt;
      if (param === "p3") this.v1.p3 = pt;
    } else if (curve === "v1") {
      if (param === "p0") this.u0.p3 = pt;
      if (param === "p3") this.u1.p3 = pt;
    }
  }

  /**
   * Update (reassign) an entire boundary curve, maintaining endpoint
   * constraints on neighboring curves.
   */
  updateCurve(curve: string, newCurve: Bezier): void {

    // $FlowIgnore
    this[curve] = newCurve;

    if (curve === "u0") {
      this.v0.p0 = this.u0.p0;
      this.v1.p0 = this.u0.p3;
    } else if (curve === "v0") {
      this.u0.p0 = this.v0.p0;
      this.u1.p0 = this.v0.p3;
    } else if (curve === "u1") {
      this.v0.p3 = this.u1.p0;
      this.v1.p3 = this.u1.p3;
    } else if (curve === "v1") {
      this.u0.p3 = this.u1.p0;
      this.u1.p3 = this.u1.p3;
    }
  }
}

export default Surface;
