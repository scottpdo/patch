import React from 'react';
import Firebase from 'firebase';

import FirebaseMiddleware from './utils/FirebaseMiddleware';
let FirebaseHelper;

import CanvasComponent from './components/CanvasComponent';
import UIComponent from './components/UIComponent';
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

    this.state = {
      d: 20,
      i: 0,
      curves: {},
      origCurves: {},
      activePt: 0,
      animating: false,
      ready: false,
      fullControls: false,
    };

    this.isReady = this.isReady.bind(this);

    // bind functions for UI controls
    this.controls = {
      restore: this.restore.bind(this),
      reticulate: this.reticulate.bind(this),
      rotate: this.rotate.bind(this, 0),
      fullControls: () => { this.setState({ fullControls: true }); },
      setCurvePt: (curve, pt, coord, value) => {
        FirebaseHelper.updatePointCoord(curve, pt, coord, value)
      }
    };
  }

  isReady(count) {
    if (count === 4) return this.setState({ ready: true });
  }

  componentDidMount() {

    let ref = Firebase.database().ref('001');

    FirebaseHelper = FirebaseMiddleware(ref);

    let count = 0;

    ["u0", "u1", "v0", "v1"].forEach((which) => {

      ref.child("/" + which).once('value', (snapshot) => {
        count++;
        let curves = this.state.curves;
        let origCurves = this.state.origCurves;
        curves[which] = FirebaseHelper.snapshotToBezier(snapshot);
        origCurves[which] = FirebaseHelper.snapshotToBezier(snapshot);
        this.setState({ curves, origCurves }, this.isReady.call(this, count));
      });

      ref.child("/" + which).on('value', (snapshot) => {
        let curves = this.state.curves;
        curves[which] = FirebaseHelper.snapshotToBezier(snapshot);
        this.setState({ curves });
      });
    });
  }

  reticulate(e) {
    this.setState({ d: +e.target.value });
  }

  restore() {
    ["u0", "u1", "v0", "v1"].forEach((which) => {
      let i = 0;
      while (i < 4) {
        // get original control point of curve
        let pt = this.state.origCurves[which]["pt" + i]();
        FirebaseHelper.updatePoint(which, i, pt);
        i++;
      }
    });
  }

  animate() {

  }

  rotate(i) {
    let pt = this.state.curves.u0.p1;
    console.log(pt.toArray());
    FirebaseHelper.updatePoint("u0", 1, pt);
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
          curves={this.state.curves}
          controls={this.controls}
        /> :
        <div style={container}>
          <CanvasComponent
            curves={this.state.curves}
            d={this.state.d}
            animating={this.state.animating}
          />
          <UIComponent
            controls={this.controls}
            d={this.state.d}
            animating={this.state.animating}
          />
        </div>
    ) : null;
  }
}

export default App;
