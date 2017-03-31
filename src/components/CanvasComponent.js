import React, { Component, PropTypes } from 'react';
import _ from 'lodash';

import Point from '../Point';
import Bezier from '../Bezier';
import Camera from '../Camera';

/**
 * A React component that handles drawing.
 * @namespace
 */
class CanvasComponent extends Component {
  constructor() {
    super();
    /**
     * @memberof CanvasComponent
     * @type {Object}
     */
    this.state = {
      /**
       * HTMLCanvasElement that gets drawn to the screen.
       * @memberof CanvasComponent.state
       */
      canvas: null,
      buffer: document.createElement('canvas'),
      camera: new Camera(new Point(), new Point()),
    };
  }

  componentWillReceiveProps() {
    this.update();
  }

  /**
   * Evaluate a point on the surface in u/v space, returning
   * a Point world space.
   * @param {Number} u The u parameter, between 0 and 1 (inclusive).
   * @param {Number} v The v parameter, between 0 and 1 (inclusive).
   * @returns {Point} The point on the surface.
   */
  patch(u, v) {
    const u0 = this.props.curves.u0;
    const u1 = this.props.curves.u1;
    const v0 = this.props.curves.v0;
    const v1 = this.props.curves.v1;

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
   * Given a Point in world space, project it onto the screen.
   * @param {Point} pt The Point to project.
   * @returns {Point} pt - The Point projected to screen-space.
   */
  transform(pt) {
    const buffer = this.state.buffer;

    pt.moveX(-0.5);
    pt.moveY(-0.5);
    pt.moveZ(1.5);
    let f = pt => pt.x() / pt.z(),
        g = pt => pt.y() / pt.z();

    let dim = Math.min(buffer.width, buffer.height);
    let x = Math.round(buffer.width / 2 + dim * f(pt)),
        y = Math.round(buffer.height / 2 - dim * g(pt));

    return new Point(x, y, 0);
  }

  /**
   * Draw the points to the screen.
   */
  draw() {
    console.log('redrawing');

    const canvas = this.state.canvas;
    const buffer = this.state.buffer;
    const context = buffer.getContext('2d');
    const canvasContext = canvas.getContext('2d');
    const width = buffer.width;
    const height = buffer.height;

    const d = 1 / this.props.d;

    let nu = 0; // number of divisions in u/v direction
    let nv = 0;
    let pts = [];

    // bg
    context.fillStyle = 'rgb(0, 0, 0)';
    context.fillRect(0, 0, width, height);

    // first pass: calculate upper/lower z bounds
    while (nu <= this.props.d) {
      nv = 0;

      while (nv <= this.props.d) {
        let pt = this.patch(nu * d, nv * d);
        pts.push(pt);

        nv++;
      }

      nu++;
    }

    // 2nd pass: draw
    pts = pts.map(pt => this.transform(pt)).reverse();

    // quads
    for (let u = 0; u < nu - 1; u++) {
      for (let v = 0; v < nv - 1; v++) {
        // start pt
        const i = u * nv + v;
        const j = i + 1;
        const k = (u + 1) * nv + v + 1;
        const l = k - 1;

        let pt = pts[i];

        context.lineWidth = 1;
        context.strokeStyle = 'rgb(255, 255, 255)';

        context.beginPath();
        context.moveTo(pt.x, pt.y);

        pt = pts[j]; context.lineTo(pt.x(), pt.y());
        pt = pts[k]; context.lineTo(pt.x(), pt.y());
        pt = pts[l]; context.lineTo(pt.x(), pt.y());
        pt = pts[i]; context.lineTo(pt.x(), pt.y());

        context.closePath();
        context.stroke();
      }
    }

    canvasContext.drawImage(buffer, 0, 0, canvas.width, canvas.height);

    // clear pts
    pts = [];
  }

  /**
   * Given new dimensions, redraw the canvas.
   */
  update() {

    let canvas = this.refs.canvas;
    let buffer = this.state.buffer;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    buffer.width = 1.2 * canvas.width;
    buffer.height = 1.2 * canvas.height;

    this.setState({ canvas }, this.draw);
  }

  download() {
      let canvas = this.state.buffer;
      let url = canvas.toDataURL(),
          a = document.createElement('a');
      a.href = url;
      a.download = 'patch.png';
      return a.click();
  }

  /**
   * Sets up canvas and adds global event listeners.
   */
  componentDidMount() {

    window.addEventListener(
      'resize',
      _.debounce(this.update.bind(this), 250),
    );

    window.addEventListener('keyup', e => {
      if (e.keyCode === 13) this.download.call(this);
    })

    this.update();
  }

  render() {
    return <canvas ref="canvas" />;
  }
}

CanvasComponent.propTypes = {
  curves: PropTypes.shape({
    u0: PropTypes.instanceOf(Bezier).isRequired,
    u1: PropTypes.instanceOf(Bezier).isRequired,
    v0: PropTypes.instanceOf(Bezier).isRequired,
    v1: PropTypes.instanceOf(Bezier).isRequired,
  }).isRequired,
};

export default CanvasComponent;
