import React from 'react';
import URL from 'url-parse';
import _ from 'lodash';

import Surface from './Surface';

import Canvas from './components/Canvas';
import UI from './components/UI';
import FullControls from './components/FullControls';

import easing from './utils/easing';

import './App.css';

class App extends React.Component {

  constructor() {

    super();

    // set full controls based on URL parameter
    const query = new URL(window.location.href, null, true).query;
    let fullControls = (query && query.controls === "1");

    this.state = {
      d: 12,
      i: 0,
      srf: new Surface(),
      activePt: 0,
      ready: false,
      fullControls,
    };

    this.iter = this.iter.bind(this);

    // bind functions for UI controls
    this.controls = {
      morph: this.animate.bind(this, () => this.state.srf.morph()),
      restore: this.animate.bind(this, () => new Surface()),
      reticulate: this.reticulate.bind(this),
      rotate: this.rotate.bind(this, 0),
      rotateXYPlus: this.rotateXY.bind(this, 1),
      rotateXYMinus: this.rotateXY.bind(this, -1),
      rotateYZPlus: this.rotateYZ.bind(this, 1),
      rotateYZMinus: this.rotateYZ.bind(this, -1),
      fullControls: () => {
        let href = window.location.origin + "/?controls=1";
        window.open(href, "Pt. Controls",
        "top=50,left=50,width=400,height=400");
      }
    };
  }

  iter() {
    this.setState({ i: this.state.i + 1 });
  }

  componentDidMount() {
  }

  rotateXY(angle = 0) {

    const srf = this.state.srf;

    ["u0", "u1", "v0", "v1"].forEach((k) => {
      ["p0", "p1", "p2", "p3"].forEach((pt) => {
        srf[k][pt].moveX(-0.5)
          .moveY(-0.5)
          .rotateXY(angle)
          .moveX(0.5)
          .moveY(0.5);
      });
    });

    this.setState({ i: this.state.i + 1 });
  }

  rotateYZ(angle = 0) {

    const srf = this.state.srf;

    ["u0", "u1", "v0", "v1"].forEach((k) => {
      ["p0", "p1", "p2", "p3"].forEach((pt) => {
        srf[k][pt].moveX(-0.5)
          .moveY(-0.5)
          .rotateYZ(angle)
          .moveX(0.5)
          .moveY(0.5);
      });
    });

    this.setState({ i: this.state.i + 1 });
  }

  rotate(i) {

    const srf = this.state.srf;
    const duration = 100;

    const t = i / duration;

    ["u0", "u1", "v0", "v1"].forEach((k) => {
      ["p0", "p1", "p2", "p3"].forEach((pt) => {
        srf[k][pt].moveX(-0.5)
          .moveY(-0.5)
          .rotateYZ(easing.dEase(t) * 1)
          .rotateXY(easing.dEase(t) * 0.5)
          .moveX(0.5)
          .moveY(0.5);
      });
    });

    this.setState({ i: this.state.i + 1 });

    if (i < duration) {
      return window.requestAnimationFrame(this.rotate.bind(this, i + 1));
    }
  }

  reticulate(e) {
    this.setState({ d: +e.target.value });
  }

  animate(newSrfFactory) {

    if (this.state.animating) return;

    this.setState({ animating: true });

    if (_.isNil(newSrfFactory)) throw new Error("Can't animate without a target Surface function!");

    const duration = 100;
    const origSrf = this.state.srf;
    const newSrf = newSrfFactory();

    let srf = this.state.srf;

    const updatePts = (iter) => {

      // parametrize time 0-1
      // const t = easing.dEase(iter / duration) / duration;

      ["u0", "u1", "v0", "v1"].forEach((crv) => {
        srf[crv] = origSrf[crv].lerp(newSrf[crv], iter / duration);
      });

      this.setState({ srf });

      // if not done, keep animating
      if (iter < duration) {
        return window.requestAnimationFrame(updatePts.bind(this, iter + 1));
      }

      return this.setState({ animating: false });
    };

    updatePts(0);
  }

  render() {
    let activePt = this.state.activePt;

    const container = {
      height: '100vh',
      width: '100vw',
    };

    const pts = this.state.pts;

    while (activePt < 0) activePt += pts.length;

    return (
      this.state.fullControls ?
        <FullControls
          srf={this.state.srf}
          controls={this.controls}
        /> :
        <div style={container}>
          <Canvas
            srf={this.state.srf}
            d={this.state.d}
          />
          <UI
            controls={this.controls}
            d={this.state.d}
          />
        </div>
      );
  }
}

export default App;
