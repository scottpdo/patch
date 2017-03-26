import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import Point from '../Point';
import Camera from '../Camera';

/**
 * A React component that handles drawing.
 * @namespace
 */
class CanvasComponent extends React.Component {

    constructor() {

        super();

        /**
         * @memberof CanvasComponent
         * @type {Object}
         */
        this.state = {
            /**
             * HTMLCanvasElement that gets drawn to the screen.
             * @memberof CanvasComponent.state
             */
            canvas: null,
            bound: 0, minX: 0, minY: 0
        };
    }

    /**
     * Evaluate a point on the surface in u/v space, returning
     * a Point world space.
     * @param {Number} u The u parameter, between 0 and 1 (inclusive).
     * @param {Number} v The v parameter, between 0 and 1 (inclusive).
     * @returns {Point} The point on the surface.
     */
    evaluate(u, v) {

        let u0 = this.props.curves.u0,
            u1 = this.props.curves.u1,
            v0 = this.props.curves.v0,
            v1 = this.props.curves.v1,
            Lu = u0.evaluate(u).multiply(1 - v).add(u1.evaluate(u).multiply(v)),
            Lv = v0.evaluate(v).multiply(1 - u).add(v1.evaluate(v).multiply(u)),
            B = u0.evaluate(0).multiply((1 - u) * (1 - v))
                .add(u0.evaluate(1).multiply(u * (1 - v)))
                .add(u1.evaluate(0).multiply((1 - u) * v))
                .add(u1.evaluate(1).multiply(u * v));

        let C = Lu.add(Lv).add(B.multiply(-1));

        return C;
    }

    /**
     * Given a Point in world space, project it onto the screen.
     * @param {Point} pt The Point to project.
     * @returns {Point} pt - The Point projected to screen-space.
     */
    transform(pt) {

        let bound = this.state.bound,
            { minX, minY } = {
                minX: this.state.minX,
                minY: this.state.minY
            };

        // isometric projection
        let f = (x, y) => 2 * (x - y),
            g = (x, y) => x + y;
        //
        // perspective projection (TODO)
        // let f = pt => pt.x(),
        //     g = pt => pt.y(),
        //     h = pt => 1;

        let x = canvas.width / 2 + f(pt.x(), pt.y()) * bound / 2,
            y = canvas.height * 7 / 8 - g(pt.x(), pt.y()) * bound / 2 - pt.z() * canvas.height / 20;
        // let x = canvas.width * f(pt),
        //     y = canvas.height * f(pt);

        return new Point(x, y, 0);
    }

    /**
     * Draw the points to the screen.
     */
    draw() {

        console.log('redrawing');

        let canvas = this.state.canvas,
            context = canvas.getContext('2d'),
            width = canvas.width,
            height = canvas.height;

        // bg
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

                let pt = this.evaluate(nu * d, nv * d);
                pts.push(pt);

                nv++;
            }

            nu++;
        }

        // 2nd pass: draw
        pts = pts.map(pt => this.transform(pt)).reverse();

        // quads
        for (let u = 0; u < nu - 1; u++) {

            for (let v = 0; v < nv - 1; v++) {

                // start pt
                let i = u * nv + v,
                    j = i + 1,
                    k = (u + 1) * nv + v + 1,
                    l = k - 1;

                let pt = pts[i];

                context.lineWidth = 1;
                context.strokeStyle = 'rgb(255, 255, 255)';

                context.beginPath();
                context.moveTo(pt.x, pt.y);

                pt = pts[j]; context.lineTo(pt.x(), pt.y());
                pt = pts[k]; context.lineTo(pt.x(), pt.y());
                pt = pts[l]; context.lineTo(pt.x(), pt.y());
                pt = pts[i]; context.lineTo(pt.x(), pt.y());

                context.closePath();
                context.stroke();
            }
        }

        // clear pts
        pts = [];
    }

    /**
     * Given new dimensions, redraw the canvas.
     */
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
        a.download = 'patch.png';
        return a.click();
    }

    /**
     * Sets up canvas and adds global event listeners.
     */
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
