import React from 'react';
import ReactDOM from 'react-dom';
import Point from './Point';
import Bezier from './Bezier';
import CanvasComponent from './components/CanvasComponent.jsx';

class MainComponent extends React.Component {
  constructor() {
    super();

    const a0 = new Point(0, 0, 0);
    const a1 = new Point(0.333, 0, 0);
    const a2 = new Point(0.667, 0, 0);
    const a3 = new Point(1, 0, 0);

    const b0 = new Point(0, 1, 0);
    const b1 = new Point(0.333, 1, 0);
    const b2 = new Point(0.667, 1, 0);
    const b3 = new Point(1, 1, 0);

    const c1 = new Point(0, 0.333, 0);
    const c2 = new Point(0, 0.667, 0);

    const d1 = new Point(1, 0.333, 0);
    const d2 = new Point(1, 0.667, 0);

    this.state = {
      d: 20,
      i: 0,
      activePt: 0,
      pts: [a0, a1, a2, a3, d1, d2, b3, b2, b1, b0, c2, c1],
      curves: {
        u0: new Bezier(a0, c1, c2, b0),
        u1: new Bezier(a3, d1, d2, b3),
        v0: new Bezier(a0, a1, a2, a3),
        v1: new Bezier(b0, b1, b2, b3),
      },
      animating: false,
    };

    // bind functions
    this.animate = this.animate.bind(this);
    this.restore = this.restore.bind(this);
    this.reticulate = this.reticulate.bind(this);
    this.rotate = this.rotate.bind(this, 0);
  }

  componentDidMount() {
    window.addEventListener('keyup', (e) => {
      this.setState({ i: this.state.i + 1 });

      const pts = this.state.pts;

      let activePt = this.state.activePt;

      while (activePt < 0) activePt += pts.length;

      if (e.keyCode === 37) this.setState({ activePt: activePt - 1 });
      if (e.keyCode === 38) pts[(activePt) % pts.length].moveZ(0.1);
      if (e.keyCode === 39) this.setState({ activePt: activePt + 1 });
      if (e.keyCode === 40) pts[(activePt) % pts.length].moveZ(-0.1);
    });
  }

  reticulate(e) {
    this.setState({ d: +e.target.value });
  }

  animate() {
    this.setState({ animating: true }, () => {
      const duration = 60;
      const deform = r => (2 * r * Math.random()) - r;

      // easing function for reference
      // const ease = (t) => t < 0.5 ? 4*t*t*t : (t-1)*((2*t)-2)*((2*t)-2)+1;
      // derivative of easing function
      const dEase = (t) => t < 0.5 ? 12 * t * t : 12 * (t - 1) * (t - 1);
      const xBound = 0.2;
      const yBound = 0.2;
      const zBound = 2.0;

      this.state.pts.forEach(pt => {
        // set original
        if (pt.origX == null) pt.origX = pt.x();
        if (pt.origY == null) pt.origY = pt.y();
        if (pt.origZ == null) pt.origZ = pt.z();

        pt.dx = deform(xBound);
        pt.dy = deform(yBound);
        pt.dz = deform(zBound);
      });

      const updatePts = (iter) => {
        const pts = this.state.pts;

        // parametrize time 0-1
        const t = iter / duration;

        pts.forEach((pt) => {
          pt.moveX((dEase(t) * pt.dx) / duration);
          pt.moveY((dEase(t) * pt.dy) / duration);
          pt.moveZ((dEase(t) * pt.dz) / duration);
        });

        this.setState({ i: this.state.i + 1 });

        // if not done, keep animating
        if (iter < duration) {
          return window.requestAnimationFrame(updatePts.bind(this, iter + 1));
        }

        // if done, clean up
        this.state.pts.forEach(pt => {
          delete pt.dx;
          delete pt.dy;
          delete pt.dz;
        });

        return this.setState({ animating: false });
      };

      updatePts(0);
    });
  }

  restore() {
    this.setState({ animating: true }, () => {
      const duration = 60;

      // easing function for reference
      // const ease = (t) => t < 0.5 ? 4*t*t*t : (t-1)*((2*t)-2)*((2*t)-2)+1;
      // derivative of easing function
      const dEase = (t) => t < 0.5 ? 12 * t * t : 12 * (t - 1) * (t - 1);

      // assume we have already animated and set false if not
      let hasAnimated = true;

      this.state.pts.forEach((pt) => {
        // check if we have animated
        if (pt.origX == null || pt.origY == null || pt.origZ == null) {
          hasAnimated = false;
        } else {
          pt.dx = pt.origX - pt.x();
          pt.dy = pt.origY - pt.y();
          pt.dz = pt.origZ - pt.z();
        }
      });

      // if not, nothing to do!
      if (!hasAnimated) return;

      const updatePts = (iter) => {
        const pts = this.state.pts;

        // parametrize time 0-1
        const t = iter / duration;

        pts.forEach((pt) => {
          pt.moveX((dEase(t) * pt.dx) / duration);
          pt.moveY((dEase(t) * pt.dy) / duration);
          pt.moveZ((dEase(t) * pt.dz) / duration);
        });

        this.setState({ i: this.state.i + 1 });

        // if not done, keep animating
        if (iter < duration) {
          return window.requestAnimationFrame(updatePts.bind(this, iter + 1));
        }

        return this.setState({ animating: false });
      };

      updatePts(0);
    });
  }

  rotate(i) {
    for (let j = 0; j < this.state.pts.length; j += 1) {
      this.state.pts[j].moveX(-0.5)
        .moveY(-0.5)
        .rotate(1)
        .moveX(0.5)
        .moveY(0.5);
    }

    this.setState({ i: this.state.i + 1 });

    if (i < 100) window.requestAnimationFrame(this.rotate.bind(this, i + 1));
  }

  render() {
    let activePt = this.state.activePt;

    const containerStyle = {
      height: '100vh',
      width: '100vw',
    };

    const canvasStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
    };

    const pts = this.state.pts;

    while (activePt < 0) activePt += pts.length;

    return (
      <div style={containerStyle}>
        <CanvasComponent
          style={canvasStyle}
          curves={this.state.curves}
          d={this.state.d}
          activePt={pts[activePt % pts.length]} animating={this.state.animating}
        />
        <input
          type="range"
          onInput={this.reticulate}
          defaultValue={this.state.d} min="2" max="40"
        />
        <br />
        <button
          onClick={this.animate}
          disabled={this.state.animating}
        >Animate
        </button>
        <br />
        <button
          onClick={this.restore}
          disabled={this.state.animating}
        >Restore</button>
        <br />
        <button onClick={this.rotate}>Rotate</button>
      </div>
    );
  }
}

ReactDOM.render(
  <MainComponent />,
  document.getElementById('main'),
);
