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
            d: 5,
            i: 0,
            activePt: 0,
            pts: [a0, a1, a2, a3, d1, d2, b3, b2, b1, b0, c2, c1],
            curves: {
                u0: new Bezier(a0, c1, c2, b0),
                u1: new Bezier(a3, d1, d2, b3),
                v0: new Bezier(a0, a1, a2, a3),
                v1: new Bezier(b0, b1, b2, b3)
            }
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
                <CanvasComponent style={canvasStyle} curves={this.state.curves} d={this.state.d} activePt={pts[activePt % pts.length]} />
                <input type="range" onInput={this.reticulate.bind(this)} value={this.state.d} min="2" max="40" />
            </div>
        );
    }
}

ReactDOM.render(
    <MainComponent />,
    document.getElementById('main')
);
