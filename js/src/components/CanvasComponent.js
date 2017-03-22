import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

class CanvasComponent extends React.Component {

    constructor() {

        super();

        // set up fill patterns
        /* let patterns = [];
        for (let i = 1; i < 10; i++) {

            let canvas = document.createElement('canvas'),
                context = canvas.getContext('2d');

            canvas.width = canvas.height = 2 * i;

            context.fillStyle = 'rgb(255, 255, 255)';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.lineWidth = 0.5;

            context.beginPath();
            context.moveTo(1, 1);
            context.lineTo(1, canvas.height);
            context.moveTo(1, 1);
            context.lineTo(canvas.width, 1);
            context.closePath();
            context.stroke();

            patterns.push(context.createPattern(canvas, 'repeat'));
        } */

        this.state = {
            canvas: null,
            bound: 0, minX: 0, minY: 0,
            minZ: -1, maxZ: 1
        };
    }

    // evaluate at u, v parameters (0 to 1)
    P(s, t) {

        let u0 = this.props.curves.u0,
            u1 = this.props.curves.u1,
            v0 = this.props.curves.v0,
            v1 = this.props.curves.v1,
            Lu = u0.evaluate(s).multiply(1 - t).add(u1.evaluate(s).multiply(t)),
            Lv = v0.evaluate(t).multiply(1 - s).add(v1.evaluate(t).multiply(s)),
            B = u0.evaluate(0).multiply((1 - s) * (1 - t))
                .add(u0.evaluate(1).multiply(s * (1 - t)))
                .add(u1.evaluate(0).multiply((1 - s) * t))
                .add(u1.evaluate(1).multiply(s * t));

        let C = Lu.add(Lv).add(B.multiply(-1));

        return C;
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

        // isometric projection
        let f = (x, y) => 2 * (x - y),
            g = (x, y) => x + y;

        let x = canvas.width / 2 + f(pt.x(), pt.y()) * bound / 2,
            y = canvas.height * 7 / 8 - g(pt.x(), pt.y()) * bound / 2 - pt.z() * canvas.height / 20,
            z = (pt.z() - minZ) / (maxZ - minZ);

        // z = 0 to 255
        z = Math.round(255 * z);
        // z = Math.round(z * (this.state.patterns.length - 1));

        return { x, y, z };
    }

    draw() {

        console.log('redrawing');

        let canvas = this.state.canvas,
            context = canvas.getContext('2d'),
            width = canvas.width,
            height = canvas.height;

        let minZ = this.state.minZ,
            maxZ = this.state.maxZ;

        // bg
        // context.fillStyle = 'rgb(80, 200, 255)';
        context.fillStyle = 'rgb(0, 0, 0)';
        context.fillRect(0, 0, width, height);

        let d = 1 / this.props.d;

        let nu = 0, // number of divisions in u/v direction
            nv = 0,
            pts = [];

        // first pass: calculate upper/lower z bounds
        while (nu <= this.props.d) {

            nv = 0;

            while (nv <= this.props.d) {

                let pt = this.P(nu * d, nv * d);
                if (pt.z < minZ) minZ = pt.z;
                if (pt.z > maxZ) maxZ = pt.z;

                pts.push(pt);

                nv++;
            }

            nu++;
        }

        // 2nd pass: draw
        this.setState({ minZ, maxZ }, () => {

            pts = pts.map(pt => this.transform(pt)).reverse();

            // quads
            for (let u = 0; u < nu - 1; u++) {

                for (let v = 0; v < nv - 1; v++) {

                    // start pt
                    let i = u * nv + v,
                        j = i + 1,
                        k = (u + 1) * nv + v + 1,
                        l = k - 1;

                    let pt = pts[i],
                        z = Math.round((pts[i].z + pts[j].z + pts[k].z + pts[l].z) / 4); // average corners

                    let color = 'rgb(' + z + ',' + z + ',' + z + ')';
                    // let color = this.state.patterns[z];
                    context.lineWidth = 1;
                    context.fillStyle = color;

                    context.beginPath();
                    context.moveTo(pt.x, pt.y);

                    pt = pts[j]; context.lineTo(pt.x, pt.y);
                    pt = pts[k]; context.lineTo(pt.x, pt.y);
                    pt = pts[l]; context.lineTo(pt.x, pt.y);
                    pt = pts[i]; context.lineTo(pt.x, pt.y);

                    context.closePath();
                    // context.fill();
                    context.strokeStyle = 'rgb(255, 255, 255)';
                    context.stroke();
                }
            }

            // clear pts
            pts = [];

            // draw dot for activePt
            // let active = this.transform(this.props.activePt);
            // context.beginPath();
            // context.fillStyle = 'rgb(255, 0, 0)';
            // context.arc(active.x, active.y, 8, 0, Math.PI * 2);
            // context.fill();
            // context.closePath();
            //
            // context.font = '16px Helvetica';
            // context.fillStyle = 'rgb(0, 0, 0)';
            // context.fillText("active control pt", active.x + 15, active.y + 5);
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

    componentWillReceiveProps(nextProps) {
        this.update();
    };

    download() {
        let canvas = this.refs.canvas;
        let url = canvas.toDataURL(),
            a = document.createElement('a');
        a.href = url;
        a.download = 'linear-patch-' + this.props.p + '.png';
        return a.click();
    }

    componentDidMount() {

        let canvas = this.refs.canvas;
        window.canvas = canvas; // debugging

        window.addEventListener(
            'resize',
            _.debounce(this.update.bind(this), 250)
        );

        window.addEventListener('keyup', e => {
            if (e.keyCode == 13) this.download.call(this);
        })

        this.update();
    }

    render() {
        return <canvas style={this.props.style} ref="canvas" />;
    }
}

export default CanvasComponent;
