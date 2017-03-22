import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import Point from './Point';
import Bezier from './Bezier';
import CanvasComponent from './components/CanvasComponent';

class MainComponent extends React.Component {

    constructor() {

        super();

        let a0 = new Point(0, 0, 0);
        let a1 = new Point(0.333, 0, 0);
        let a2 = new Point(0.667, 0, 0);
        let a3 = new Point(1, 0, 0);

        let b0 = new Point(0, 1, 0);
        let b1 = new Point(0.333, 1, 0);
        let b2 = new Point(0.667, 1, 0);
        let b3 = new Point(1, 1, 0);

        let c1 = new Point(0, 0.333, 0);
        let c2 = new Point(0, 0.667, 0);

        let d1 = new Point(1, 0.333, 0);
        let d2 = new Point(1, 0.667, 0);

        this.state = {
            d: 20,
            i: 0,
            activePt: 0,
            pts: [a0, a1, a2, a3, d1, d2, b3, b2, b1, b0, c2, c1],
            curves: {
                u0: new Bezier(a0, c1, c2, b0),
                u1: new Bezier(a3, d1, d2, b3),
                v0: new Bezier(a0, a1, a2, a3),
                v1: new Bezier(b0, b1, b2, b3)
            },
            animating: false
        };
    }

    componentDidMount() {

        window.addEventListener('keyup', e => {

            this.setState({ i: this.state.i + 1 });

            let activePt = this.state.activePt,
                pts = this.state.pts;

            while (activePt < 0) activePt += pts.length;

            if (e.keyCode == 37) this.setState({ activePt: activePt - 1 });
            if (e.keyCode == 38) pts[(activePt) % pts.length].moveZ(0.1);
            if (e.keyCode == 39) this.setState({ activePt: activePt + 1 });
            if (e.keyCode == 40) pts[(activePt) % pts.length].moveZ(-0.1);
        });
    }

    reticulate(e) {
        this.setState({ d: +e.target.value });
    }

    animate() {

        let rate = 0.05;

        let deform = r => 2 * r * Math.random() - r;

        this.state.pts.forEach(pt => {

            // set original?
            if (!pt.hasOwnProperty('origX')) pt.origX = pt.x();
            if (!pt.hasOwnProperty('origY')) pt.origY = pt.y();

            let targetX = pt.origX + deform(0.2),
                targetY = pt.origY + deform(0.2),
                targetZ = deform(0.5);

            pt._targetX = targetX;
            pt._targetY = targetY;
            pt._targetZ = targetZ;
        });

        let updatePts = () => {

            let done = true;

            let pts = this.state.pts;

            pts.forEach((pt, i) => {

                let conditions = (
                    Math.abs(pt.x() - pt._targetX) > rate ||
                    Math.abs(pt.y() - pt._targetY) > rate ||
                    Math.abs(pt.z() - pt._targetZ) > rate
                );

                if ( conditions ) {
                    done = false;
                    if ( Math.abs(pt.x() - pt._targetX) > rate )
                        pt.moveX(0.05 * (pt._targetX > pt.x() ? rate : -rate));
                    if ( Math.abs(pt.y() - pt._targetY) > rate )
                        pt.moveY(0.05 * (pt._targetY > pt.y() ? rate : -rate));
                    if ( Math.abs(pt.z() - pt._targetZ) > rate )
                        pt.moveZ(pt._targetZ > pt.z() ? rate : -rate);
                }
            });

            this.setState({ i: this.state.i + 1 });

            // if not done, keep animating
            if (!done) return requestAnimationFrame(updatePts);

            // if done, clean up
            if (done) this.state.pts.forEach(pt => {
                delete pt._targetX;
                delete pt._targetY;
                delete pt._targetZ;
            });
        };

        updatePts();

        this.setState({ i: this.state.i + 1 });
    }

    render() {

        let containerStyle = {
            height: '100vh',
            width: '100vw'
        };

        let canvasStyle = {
            position: 'absolute',
            top: 0,
            left: 0
        };

        let activePt = this.state.activePt,
            pts = this.state.pts;

        while (activePt < 0) activePt += pts.length;

        return (
            <div style={containerStyle}>
                <CanvasComponent style={canvasStyle} curves={this.state.curves} d={this.state.d} activePt={pts[activePt % pts.length]} animating={this.state.animating} />
                <input type="range" onInput={this.reticulate.bind(this)} defaultValue={this.state.d} min="2" max="40" />
                <br />
                <button onClick={this.animate.bind(this)}>Animate</button>
            </div>
        );
    }
}

ReactDOM.render(
    <MainComponent />,
    document.getElementById('main')
);
