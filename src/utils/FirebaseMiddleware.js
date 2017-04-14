// @flow

import Point from '../Point';
import Bezier from '../Bezier';
import Surface from '../Surface';

export default (database: Object) => {
  return {
    snapshotToSurface: (snapshot: Object): Surface => {
      let srf = new Surface();
      for (let k in snapshot.val()) {
        let curve = snapshot.val()[k];
        curve = curve.map(arr => new Point(arr));
        // $FlowIgnore
        srf[k] = new Bezier(curve);
      }
      return srf;
    },
    snapshotToBezier: (snapshot: Object): Bezier => {
      let curve = snapshot.val();
      for (let i in curve) {
        let pt = curve[i];
        curve[i] = new Point(pt);
      }
      return new Bezier(curve);
    },
    updatePoint: (curveName: string, index: number, pt: Point): void => {
      let data = {};
      data[index] = pt.toArray();
      database.child(curveName).update(data);
    },
    updatePointCoord: (curveName: string, index: number, coord: string, value: number): void => {
      if (typeof coord === Number) throw new Error("coord expects a string!");
      let data = {};
      data[coord === "x" ? 0 : coord === "y" ? 1 : 2] = value;
      database.child(curveName).child(index).update(data);
    },
    updateCurve: function updateCurve(curveName: string, curve: Bezier): void {
      if (!(curve instanceof Bezier)) throw new Error("Must update a curve from a Bezier object.");
      let data = [];
      for (let p in curve) { data.push(curve[p].toArray()); }
      database.child(curveName).set(data);
    },
    updateSurface: function updateSurface(srf: Surface): void {
      for (let k in srf) {
        this.updateCurve(k, srf[k]);
      }
    }
  }
};
