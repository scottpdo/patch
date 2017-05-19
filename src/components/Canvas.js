import React, { Component, PropTypes } from 'react';
import _ from 'lodash';

import Surface from '../Surface';
import Point from '../Point';
import Camera from '../Camera';

/**
 * A React component that handles drawing.
 * @namespace
 */
class Canvas extends Component {

  constructor() {

    super();
    /**
     * @memberof Canvas
     * @type {Object}
     */
    this.state = {
      /**
       * HTMLCanvasElement that gets drawn to the screen.
       * @memberof Canvas.state
       */
      canvas: null,
      /**
       * HTMLCanvasElement, larger than `Canvas.state.canvas`, that is stored
       * in memory and gets drawn to `Canvas.state.canvas`.
       * @memberof Canvas.state
       */
      buffer: document.createElement('canvas'),
      camera: new Camera(
        new Point(0.5, 0.5, -2),
        new Point()
      ),
      dragging: false,
      startDrag: new Point(),
    };

    this.drawBoundaryCurves = this.drawBoundaryCurves.bind(this);
  }

  componentWillReceiveProps() {
    this.update();
  }

  /**
   * Given a `Point` in world space, project it onto the screen.
   * @param {Point} pt The `Point` to project.
   * @returns {Point} pt - The `Point` projected to screen-space.
   */
  transform(pt, canvas = this.state.buffer) {

    // make a disposable point
    let p = pt.clone();

    /* perspective projection requires camera at origin,
     * facing down z-axis, so make that transform
     */
    const loc = this.state.camera.getLocation();

    p.moveX(-loc.x());
    p.moveY(-loc.y());
    p.moveZ(-loc.z());

    let f = pt => pt.x() / pt.z(),
        g = pt => pt.y() / pt.z();

    let dim = Math.min(canvas.width, canvas.height);

    let x = Math.round(canvas.width / 2 + dim * f(p)),
        y = Math.round(canvas.height / 2 - dim * g(p));

    return new Point(x, y, 0);
  }

  drawLine(context, start, end, stroke = 1) {

    start = this.transform(start);
    end   = this.transform(end);

    context.strokeStyle = 'rgb(255, 255, 255)';
    context.lineWidth = stroke;

    context.moveTo(start.x(), start.y());
    context.lineTo(end.x(), end.y());
    context.stroke();
  }

  drawBezier(context, crv, stroke = 1) {

    const p0 = this.transform(crv.p0);
    const p3 = this.transform(crv.p3);

    const pts = [p0];
    for (let i = 1; i < this.props.d; i++) {
      pts.push(this.transform(crv.evaluate(i / this.props.d)));
    }
    pts.push(p3);

    context.strokeStyle = 'rgb(255, 255, 255)';
    context.lineWidth = stroke;

    context.moveTo(p0.x(), p0.y());
    pts.forEach((pt, i) => {
      if (i < pts.length) context.lineTo(pt.x(), pt.y());
    });
    context.stroke();
  }

  drawBoundaryCurves(context) {

    const u0 = this.props.srf.u0;
    const u1 = this.props.srf.u1;
    const v0 = this.props.srf.v0;
    const v1 = this.props.srf.v1;

    [u0, u1, v0, v1].forEach(crv => {
      this.drawBezier(context, crv, 3)
    });
  }

  drawInteriorCurves(context) {

    const step = 1 / this.props.d;

    for (let u = 0; u < 1; u += step) {

      for (let v = 0; v < 1; v += step) {

        const o = this.props.srf.patch(u, v);
        const p = this.props.srf.patch(_.clamp(u + step, 0, 1), v);
        const q = this.props.srf.patch(u, _.clamp(v + step, 0, 1));

        this.drawLine( context, o, p );
        this.drawLine( context, o, q );

      }
    }
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

    this.drawBoundaryCurves(context);
    this.drawInteriorCurves(context);

    canvasContext.drawImage(buffer, 0, 0, canvas.width, canvas.height);

  }

  /**
   * Given new dimensions, redraw the canvas.
   */
  update() {

    const bufferSize = 1.2;

    let canvas = this.refs.canvas;
    let buffer = this.state.buffer;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    buffer.width = bufferSize * canvas.width;
    buffer.height = bufferSize * canvas.height;

    this.setState({ canvas }, this.draw);
  }

  onMouseDown(e) {

    const pt = new Point(e.x, e.y);

    const crvs = ["u0", "u1", "v0", "v1"];

    const canvas = this.state.canvas;
    const context = canvas.getContext('2d');

    let p, c1, c2;
    let foundOne = false;

    // TODO: clean this up
    for (let i = 0; i < 4; i++) {

      const crv = crvs[i];
      const p0 = this.transform(this.props.srf[crv].p0, this.state.canvas);
      const p3 = this.transform(this.props.srf[crv].p3, this.state.canvas);

      if (pt.distance(p0) < 15) {
        p = p0;
        switch (crv) {
          case "u0":
            c1 = this.props.srf.u0.p1;
            c2 = this.props.srf.v0.p1;
            break;
          case "v0":
            c1 = this.props.srf.u0.p1;
            c2 = this.props.srf.v0.p1;
            break;
          case "v1":
            c1 = this.props.srf.u0.p2;
            c2 = this.props.srf.v1.p1;
            break;
          case "u1":
            c1 = this.props.srf.v0.p2;
            c2 = this.props.srf.u1.p1;
            break;
        }
        foundOne = true;
      }

      if (pt.distance(p3) < 15) {
        p = p3;
        switch (crv) {
          case "v1":
            c1 = this.props.srf.v1.p2;
            c2 = this.props.srf.u1.p2;
            break;
          case "u1":
            c1 = this.props.srf.v1.p2;
            c2 = this.props.srf.u1.p2;
            break;
          case "v0":
            c1 = this.props.srf.v1.p1;
            c2 = this.props.srf.u0.p2;
            break;
          case "u0":
            c1 = this.props.srf.v1.p1;
            c2 = this.props.srf.u0.p2;
            break;
        }
        foundOne = true;
      }

      if (foundOne) {

        c1 = this.transform(c1, this.state.canvas);
        c2 = this.transform(c2, this.state.canvas);

        // draw circles for end point and control points
        console.log(context);
        context.strokeStyle = 'rgb(255, 255, 255)';
        context.lineWidth = 2;

        context.moveTo(p.x(), p.y());
        context.beginPath();
        context.arc(p.x(), p.y(), 14, 0, 2 * Math.PI);
        context.closePath();
        context.stroke();

        context.moveTo(c1.x(), c1.y());
        context.beginPath();
        context.arc(c1.x(), c1.y(), 7, 0, 2 * Math.PI);
        context.closePath();
        context.stroke();

        context.moveTo(c2.x(), c2.y());
        context.beginPath();
        context.arc(c2.x(), c2.y(), 7, 0, 2 * Math.PI);
        context.closePath();
        context.stroke();

        // draw dashed lines
        context.setLineDash([6, 6]);
        context.moveTo(c1.x(), c1.y());
        context.lineTo(p.x(), p.y());
        context.lineTo(c2.x(), c2.y());
        context.stroke();

        return;
      }
    }
  }

  onMouseMove(e) {
    // if (this.state.dragging) {
    //
    //   const camera = this.state.camera;
    //   const factor = 500;
    //
    //   let loc = this.state.camera.getLocation();
    //   let startDrag = this.state.startDrag;
    //   // loc.x(this.state / factor);
    //   // loc.moveY((e.offsetY - startDrag.y()) / factor);
    //   console.log(startDrag.x() - e.offsetX / factor);
    //   this.draw.call(this);
    // }
  }

  onMouseUp() {
    this.update();
  }

  onMouseWheel(e) {

    const zoomOut = e.deltaY > 0;     // boolean
    const factor = zoomOut ? 1.1 : 0.9; // number

    let z = this.state.camera.location.z();
    this.state.camera.location.z(z * factor);

    this.update();
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
   * Sets up surface, canvas and adds global event listeners.
   */
  componentDidMount() {

    window.addEventListener(
      'resize',
      _.debounce(this.update.bind(this), 250),
    );

    window.addEventListener('keyup', e => {
      if (e.keyCode === 13) this.download.call(this);
    });

    this.refs.canvas.addEventListener('mousewheel', this.onMouseWheel.bind(this));
    this.refs.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.refs.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.refs.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));

    this.update();
  }

  render() {
    return <canvas ref="canvas" />;
  }
}

Canvas.propTypes = {
  srf: PropTypes.instanceOf(Surface).isRequired,
  d: PropTypes.number.isRequired,
};

export default Canvas;
