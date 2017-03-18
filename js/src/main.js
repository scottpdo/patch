import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import CanvasComponent from './components/CanvasComponent';

class MainComponent extends React.Component {

    constructor() {

        super();

        this.state = {
            p: 1,
            curves: {
                i: 0,
                u0: [],
                u1: [],
                v0: (u) => {
                    return {
                        x: u,
                        y: 0,
                        z: Math.cos(this.state.p * Math.PI * u)
                    };
                },
                v1: (u) => {
                    return {
                        x: u,
                        y: 1,
                        z: Math.sin(2 * Math.PI * u)
                    };
                }
            }
        };
    }

    setPeriod(e) {
        let p = +(e.target.value);
        if (p >= 0) this.setState({ p });
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

        return (
            <div style={containerStyle}>
                <CanvasComponent style={canvasStyle} p={this.state.p} curves={this.state.curves} />
                <input type="range" onChange={this.setPeriod.bind(this)} min="0" max="8" step="0.1" value={this.state.p} />
            </div>
        );
    }
}

ReactDOM.render(
    <MainComponent />,
    document.getElementById('main')
);
