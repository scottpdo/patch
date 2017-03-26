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

        this.setState({ animating: true }, () => {

        let duration = 60;

        let deform = r => 2 * r * Math.random() - r,
            // easing function
            ease = t => t < 0.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1,
            // derivative of easing function
            dEase = t => t < 0.5 ? 12*t*t : 12*(t-1)*(t-1),
            xBound = 0.2,
            yBound = 0.2,
            zBound = 2.0;

        this.state.pts.forEach(pt => {

            // set original
            if (!pt.hasOwnProperty('origX')) pt.origX = pt.x();
            if (!pt.hasOwnProperty('origY')) pt.origY = pt.y();
            if (!pt.hasOwnProperty('origZ')) pt.origZ = pt.z();

            pt.dx = deform(xBound);
            pt.dy = deform(yBound);
            pt.dz = deform(zBound);
        });

        let updatePts = (iter) => {

            let pts = this.state.pts;

            // parametrize time 0-1
            let t = iter / duration;

            pts.forEach((pt, i) => {

                pt.moveX(dEase(t) * pt.dx / duration);
                pt.moveY(dEase(t) * pt.dy / duration);
                pt.moveZ(dEase(t) * pt.dz / duration);
            });

            this.setState({ i: this.state.i + 1 });

            // if not done, keep animating
            if (iter < duration) {
                return requestAnimationFrame(updatePts.bind(this, iter + 1));
            }

            // if done, clean up
            this.state.pts.forEach(pt => {
                delete pt.dx;
                delete pt.dy;
                delete pt.dz;
            });

            this.setState({ animating: false });
        };

        updatePts(0);

        });
    }

    restore() {

        this.setState({ animating: true }, () => {

        let duration = 60;

        // assume we have animated at least once
        let hasAnimated = true;

        let deform = r => 2 * r * Math.random() - r,
            // easing function
            ease = t => t < 0.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1,
            // derivative of easing function
            dEase = t => t < 0.5 ? 12*t*t : 12*(t-1)*(t-1);

        this.state.pts.forEach(pt => {
            // check if we have animated
            if ( !pt.hasOwnProperty('origX') ||
                 !pt.hasOwnProperty('origY') ||
                 !pt.hasOwnProperty('origZ')
            ) {

                 hasAnimated = false;

            } else {
                pt.dx = pt.origX - pt.x();
                pt.dy = pt.origY - pt.y();
                pt.dz = pt.origZ - pt.z();
            }
        });

        // if not, nothing to do!
        if (!hasAnimated) return;

        let updatePts = (iter) => {

            let pts = this.state.pts;

            // parametrize time 0-1
            let t = iter / duration;

            pts.forEach((pt, i) => {

                pt.moveX(dEase(t) * pt.dx / duration);
                pt.moveY(dEase(t) * pt.dy / duration);
                pt.moveZ(dEase(t) * pt.dz / duration);
            });

            this.setState({ i: this.state.i + 1 });

            // if not done, keep animating
            if (iter < duration) {
                return requestAnimationFrame(updatePts.bind(this, iter + 1));
            }

            this.setState({ animating: false });
        };

        updatePts(0);

        });
    }

    rotate() {

        let _rotate = (i) => {

            for (let i = 0; i < this.state.pts.length; i++) {
                this.state.pts[i]
                    .moveX(-0.5).moveY(-0.5)
                    .rotate(1)
                    .moveX(0.5).moveY(0.5);
            }

            this.setState({ i: this.state.i + 1 });

            if (i < 100) requestAnimationFrame(_rotate.bind(this, i + 1));
        };

        _rotate(0);
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
                <button onClick={this.animate.bind(this)} disabled={this.state.animating}>Animate</button>
                <br />
                <button onClick={this.restore.bind(this)} disabled={this.state.animating}>Restore</button>
                <br />
                <button onClick={this.rotate.bind(this)}>Rotate</button>
            </div>
        );
    }
}

ReactDOM.render(
    <MainComponent />,
    document.getElementById('main')
);
