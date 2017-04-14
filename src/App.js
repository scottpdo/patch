import React from 'react';
import Firebase from 'firebase';
import URL from 'url-parse';

import FirebaseMiddleware from './utils/FirebaseMiddleware';
let FirebaseHelper;

import Surface from './Surface';

import Canvas from './components/Canvas';
import UI from './components/UI';
import FullControls from './components/FullControls';

import './App.css';

class App extends React.Component {

  constructor() {

    super();

    // Initialize Firebase
    const config = {
      apiKey: "AIzaSyA2UW59bbeDKE8oQrHGfhJdiezxKzQzaUA",
      authDomain: "patch-e0bcb.firebaseapp.com",
      databaseURL: "https://patch-e0bcb.firebaseio.com",
      projectId: "patch-e0bcb",
      storageBucket: "patch-e0bcb.appspot.com",
      messagingSenderId: "480634117202"
    };
    Firebase.initializeApp(config);

    // set full controls based on URL parameter
    const query = new URL(window.location.href, null, true).query;
    let fullControls = (query && query.controls === "1");

    this.state = {
      d: 20,
      i: 0,
      srf: null,
      activePt: 0,
      ready: false,
      fullControls,
    };

    this.iter = this.iter.bind(this);

    // bind functions for UI controls
    this.controls = {
      morph: this.morph.bind(this),
      restore: this.restore.bind(this),
      reticulate: this.reticulate.bind(this),
      rotate: this.rotate.bind(this, 0),
      fullControls: () => {
        let href = window.location.origin + "/?controls=1";
        window.open(href, "Pt. Controls",
        "top=50,left=50,width=400,height=400");
      },
      setCurvePt: (curve, pt, coord, value) => {
        FirebaseHelper.updatePointCoord(curve, pt, coord, value)
      }
    };
  }

  iter() {
    this.setState({ i: this.state.i + 1 });
  }

  componentDidMount() {

    let ref = Firebase.database().ref('001');

    FirebaseHelper = FirebaseMiddleware(ref);

    ref.once('value', (snapshot) => {
      // construct surface
      const srf = FirebaseHelper.snapshotToSurface(snapshot);
      this.setState({
        srf,
        ready: true,
      });
    });

    ["u0", "u1", "v0", "v1"].forEach((which) => {
      ref.child("/" + which).on('value', (snapshot) => {
        if (!this.state.ready) return;
        const curve = FirebaseHelper.snapshotToBezier(snapshot);
        this.state.srf.animateCurve(which, curve, {
          progress: this.iter,
          done: this.iter,
        });
      });
    });
  }

  rotate(i) {

    const srf = this.state.srf;
    const duration = 100;

    const dEase = (t) => t < 0.5 ? 12 * t * t : 12 * (t - 1) * (t - 1);

    const t = i / duration;

    ["u0", "u1", "v0", "v1"].forEach((k) => {
      ["p0", "p1", "p2", "p3"].forEach((pt) => {
        srf[k][pt].moveX(-0.5)
          .moveY(-0.5)
          .rotateYZ(dEase(t) * 1)
          .rotateXY(dEase(t) * 0.5)
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

  restore() {
    FirebaseHelper.updateSurface(new Surface());
  }

  morph() {
    let newSrf = this.state.srf.morph();
    FirebaseHelper.updateSurface(newSrf);
  }

  render() {
    let activePt = this.state.activePt;

    const container = {
      height: '100vh',
      width: '100vw',
    };

    const pts = this.state.pts;

    while (activePt < 0) activePt += pts.length;

    return this.state.ready ? (
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
    ) : null;
  }
}

export default App;
