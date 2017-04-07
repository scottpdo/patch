import Point from '../Point';
import Bezier from '../Bezier';

export default {
  arrayToPoint: function arrayToPoint(arr) {
    return new Point(arr);
  },
  arrayToBezier: function arrayToBezier(arr) {
    return new Bezier(arr);
  }
};
