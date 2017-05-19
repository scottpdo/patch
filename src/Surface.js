// @flow

import Point from './Point';
import Bezier from './Bezier';

const p = (x, y, z) => new Point(x, y, z);
const u0default = () => new Bezier(p(0, 0, 0), p(0.333, 0, 0), p(0.667, 0, 0), p(1, 0, 0));
const u1default = () => new Bezier(p(0, 1, 0), p(0.333, 1, 0), p(0.667, 1, 0), p(1, 1, 0));
const v0default = () => new Bezier(p(0, 0, 0), p(0, 0.333, 0), p(0, 0.667, 0), p(0, 1, 0));
const v1default = () => new Bezier(p(1, 0, 0), p(1, 0.333, 0), p(1, 0.667, 0), p(1, 1, 0));

/*
 * A patched surface from four boundary Bezier curves.
 */
class Surface {

  u0: Bezier;
  u1: Bezier;
  v0: Bezier;
  v1: Bezier;
  u0_target: Bezier;
  u1_target: Bezier;
  v0_target: Bezier;
  v1_target: Bezier;

  constructor(
    u0: Bezier = u0default(),
    u1: Bezier = u1default(),
    v0: Bezier = v0default(),
    v1: Bezier = v1default()
  ) {

    /*
     * Default Surface: square from 0-1, control points evenly spaced
     */

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

  // patchCurve(dir: string, t: number): Bezier {
  //
  //   let p0, p1, p2, p3;
  //
  //   if (dir === "u") {
  //
  //     p0 = this.v0.evaluate(t);
  //     p3 = this.v1.evaluate(t);
  //     p1 = this.patch(0.333, t);
  //     p2 = this.patch(0.667, t);
  //
  //   } else if (dir === "v") {
  //
  //     p0 = this.u0.evaluate(t);
  //     p3 = this.u1.evaluate(t);
  //     p1 = this.patch(t, 0.333);
  //     p2 = this.patch(t, 0.667);
  //
  //   } else {
  //     throw new Error("Must patchCurve along either u or v axes!");
  //   }
  //
  //   return new Bezier(p0, p1, p2, p3);
  // }

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

  animateCurve(curve: string, newCurve: Bezier, opts = {}) {

    this[curve].anim = true;

    const EPS = 0.01;
    const d = this[curve].distance(newCurve);

    if (d > EPS) {

      // animate
      this[curve].moveToward(newCurve, 0.1);

      return window.requestAnimationFrame(() => {
        this.animateCurve(curve, newCurve, opts);
        if (opts.progress) opts.progress();
      });
    }

    if (opts.done) opts.done();
  }

  merge(pt1: Point, pt2: Point) {
    const threshold = 0.01;
    if (pt1.distance(pt2) > threshold) {
      let mid = pt1.add(pt2).multiply(0.5);
      pt1.set(mid);
      pt2.set(mid);
    }
  }

  // if endpoints do not match, take average
  resolve() {
    this.merge(this.u0.p0, this.v0.p0);
    this.merge(this.u0.p3, this.v1.p0);
    this.merge(this.u1.p0, this.v0.p3);
    this.merge(this.u1.p3, this.v1.p3);
  }

  morph(opts): Surface {

    let r = () => Math.random() - 0.5;
    let rp = () => new Point(r(), r(), r());

    let s = new Surface();

    ["u0", "u1", "v0", "v1"].forEach((k) => {

      let b = this[k]; // this boundary curve

      let newCurve = new Bezier();

      ["p0", "p1", "p2", "p3"].forEach((pt) => {
        newCurve[pt] = b[pt].add(rp());
        if (k === "v0" && pt === "p0") newCurve[pt] = s.u0.p0;
        if (k === "v0" && pt === "p3") newCurve[pt] = s.u1.p0;
        if (k === "v1" && pt === "p0") newCurve[pt] = s.u0.p3;
        if (k === "v1" && pt === "p3") newCurve[pt] = s.u1.p3;
      });

      s[k] = newCurve;
    });

    // this.resolve();

    return s;
  }
}

export default Surface;
