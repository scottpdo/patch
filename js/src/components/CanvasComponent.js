import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

class CanvasComponent extends React.Component {

    constructor() {

        super();

        this.state = {
            canvas: null,
            bound: 0, minX: 0, minY: 0,
            minZ: Infinity, maxZ: -Infinity
        };
    }

    P(u, v) {

        let x = u,
            y = v,
            z = this.props.curves.v0(u) * (1 - v) + this.props.curves.v1(u) * v; // lerp

        return { x, y, z };
    }

    // u-v space to screen space
    transform(pt) {

        let bound = this.state.bound,
            { minX, minY, minZ, maxZ } = {
                minX: this.state.minX,
                minY: this.state.minY,
                minZ: this.state.minZ,
                maxZ: this.state.maxZ
            };

        pt.x = minX + pt.x * bound;
        pt.y = minY + pt.y * bound;
        pt.z = (pt.z - minZ) / (maxZ - minZ);

        // z = 0 to 255
        pt.z = Math.round(255 * pt.z);

        return { x: pt.x, y: pt.y, z: pt.z };
    }

    draw() {

        console.log('redrawing');

        let canvas = this.state.canvas,
            context = canvas.getContext('2d'),
            width = canvas.width,
            height = canvas.height;

        let minZ = this.state.minZ,
            maxZ = this.state.maxZ;

        // black bg
        context.fillStyle = 'rgba(255, 255, 0, 255)';
        context.fillRect(0, 0, width, height);

        let d = 2 / this.state.bound,
            r = 1.5;

        let pts = [];

        // first pass: calculate upper/lower z bounds
        for (let u = 0; u < 1; u += d) {

            for (let v = 0; v < 1; v += d) {

                let pt = this.P(u, v);
                if (pt.z < minZ) minZ = pt.z;
                if (pt.z > maxZ) maxZ = pt.z;

                pts.push(pt);
            }
        }

        // 2nd pass: draw
        this.setState({ minZ, maxZ }, () => {

            pts.forEach((pt, i) => {

                pt = this.transform(pt);

                let color = 'rgb(' + pt.z + ',' + pt.z + ',' + pt.z + ')';

                context.fillStyle = color;

                context.beginPath();
                context.arc(pt.x, pt.y, r, 0, 2 * Math.PI);
                context.fill();
                context.closePath();
            });

            // clear pts
            pts = [];
        });
    }

    update() {
        let canvas = this.refs.canvas;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let bound = 0.8 * Math.min(canvas.width, canvas.height),
            minX = 0.5 * (canvas.width - bound),
            minY = 0.5 * (canvas.height - bound);

        this.setState({ canvas, bound, minX, minY }, this.draw);
    }

    componentWillReceiveProps() {
        this.update.call(this);
    };

    componentDidMount() {

        let canvas = this.refs.canvas;
        window.canvas = canvas; // debugging

        window.addEventListener(
            'resize',
            _.debounce(this.update.bind(this), 250)
        );
    }

    render() {
        return <canvas style={this.props.style} ref="canvas" />;
    }
}

export default CanvasComponent;
