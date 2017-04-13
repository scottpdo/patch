import React, { Component, PropTypes } from 'react';
import _ from 'lodash';

import Surface from '../Surface';
import Point from '../Point';
import Bezier from '../Bezier';
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

    /**
     * @memberof Canvas
     * @type {Surface}
     */
    this.srf = null;
  }

  componentWillReceiveProps() {
    this.update();
  }

  /**
   * Given a `Point` in world space, project it onto the screen.
   * @param {Point} pt The `Point` to project.
   * @returns {Point} pt - The `Point` projected to screen-space.
   */
  transform(pt) {

    const buffer = this.state.buffer;

    /* perspective projection requires camera at origin,
     * facing down z-axis, so make that transform
     */
    const loc = this.state.camera.getLocation();
    pt.moveX(-loc.x());
    pt.moveY(-loc.y());
    pt.moveZ(-loc.z());

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
        let pt = this.srf.patch(nu * d, nv * d);
        pts.push(pt);

        nv++;
      }

      nu++;
    }

    // 2nd pass: draw
    pts = pts.map(pt => this.transform(pt));

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

    let startDrag = this.state.startDrag;

    startDrag.x(e.offsetX);
    startDrag.y(e.offsetY);

    this.setState({
      dragging: true,
      startDrag
    });
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
    this.setState({ dragging: false });
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

    const curves = this.props.curves;
    this.srf = new Surface(curves.u0, curves.u1, curves.v0, curves.v1);

    window.addEventListener(
      'resize',
      _.debounce(this.update.bind(this), 250),
    );

    window.addEventListener('keyup', e => {
      if (e.keyCode === 13) this.download.call(this);
    });

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
  curves: PropTypes.shape({
    u0: PropTypes.instanceOf(Bezier).isRequired,
    u1: PropTypes.instanceOf(Bezier).isRequired,
    v0: PropTypes.instanceOf(Bezier).isRequired,
    v1: PropTypes.instanceOf(Bezier).isRequired,
  }).isRequired,
  d: PropTypes.number.isRequired,
};

export default Canvas;
