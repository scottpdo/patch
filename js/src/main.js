import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

class MainComponent extends React.Component {

    constructor() {

        super();

        this.state = {
            u0: [], u1: [],
            v0: u => Math.sin(2 * Math.PI * u),
            v1: u => 2 * u - 1,
            // v1: u => 8 * (u - 0.5) * (u - 0.5) - 1,
            canvas: null,
            bound: 0, minX: 0, minY: 0,
            minZ: -1, maxZ: 1,
        };
    }

    P(u, v) {

        let x = u,
            y = v,
            z = this.state.v0(u) * (1 - v) + this.state.v1(u) * v; // lerp

        return { x, y, z };
    }

    // u-v space to screen space
    transform(x, y, z) {

        x = this.state.minX + x * this.state.bound;
        y = this.state.minY + y * this.state.bound;
        z = z;

        return { x, y, z };
    }

    draw() {

        let canvas = this.state.canvas,
            context = canvas.getContext('2d'),
            width = canvas.width,
            height = canvas.height;

        // black bg
        context.fillStyle = 'rgba(255, 255, 0, 255)';
        context.fillRect(0, 0, width, height);

        let d = 0.005,
            r = 2;

        for (let u = 0; u < 1; u += d) {

            for (let v = 0; v < 1; v += d) {

                let pt = this.P(u, v);
                pt = this.transform(pt.x, pt.y, pt.z);
                pt.z += 1; pt.z /= 2; // coerce to [0, 1]

                let zVal = Math.round(255 * pt.z);
                let color = 'rgb(' + zVal + ',' + zVal + ',' + zVal + ')';

                context.fillStyle = color;

                context.beginPath();
                context.arc(pt.x, pt.y, r, 0, 2 * Math.PI);
                context.fill();
                context.closePath();
            }
        }
    }

    componentDidMount() {

        let canvas = this.refs.canvas;
        window.canvas = canvas; // debugging

        let update = () => {

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            let bound = 0.8 * Math.min(canvas.width, canvas.height),
                minX = 0.5 * (canvas.width - bound),
                minY = 0.5 * (canvas.height - bound);

            this.setState({ canvas, bound, minX, minY }, this.draw);
        };

        update();
        window.addEventListener(
            'resize',
            _.debounce(update, 500)
        );
    }

    render() {
        return <canvas ref="canvas" />;
    }
}

ReactDOM.render(<MainComponent />, document.getElementById('main'));
