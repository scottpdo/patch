import Point from '../Point';
import Bezier from '../Bezier';

export default (database) => {
  return {
    snapshotToBezier: function snapshotToBezier(snapshot) {
      let curve = snapshot.val();
      for (let i in curve) {
        let pt = curve[i];
        curve[i] = new Point(pt);
      }
      return new Bezier(curve);
    },
    updatePoint: function(curveName, index, pt) {
      let data = {};
      data[index] = pt.toArray();
      database.child(curveName).update(data);
    },
    updatePointCoord: function updatePointCoord(curveName, index, coord, value) {
      if (typeof coord === Number) throw new Error("coord expects a string!");
      let data = {};
      data[coord === "x" ? 0 : coord === "y" ? 1 : 2] = value;
      database.child(curveName).child(index).update(data);
    }
  }
};
