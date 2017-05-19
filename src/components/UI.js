import React, { Component, PropTypes } from 'react';

import '../css/ui.css';

class UI extends Component {

  constructor() {
    super();
    this.state = {
      mouseIsDown: false
    };
  }

  trigger(cb, end) {
    if (end()) return;
    cb();
    window.requestAnimationFrame(this.trigger.bind(this, cb, end));
  }

  componentDidMount() {

    // end condition when mouse is released
    const end = () => !this.state.mouseIsDown;

    this.refs.UI.addEventListener('mousedown', (e) => {

      this.setState({ mouseIsDown: true });

      if (e.target === this.refs.rotateXYPlus) {
        this.trigger(this.props.controls.rotateXYPlus, end);
      }

      if (e.target === this.refs.rotateXYMinus) {
        this.trigger(this.props.controls.rotateXYMinus, end);
      }

      if (e.target === this.refs.rotateYZPlus) {
        this.trigger(this.props.controls.rotateYZPlus, end);
      }

      if (e.target === this.refs.rotateYZMinus) {
        this.trigger(this.props.controls.rotateYZMinus, end);
      }
    });
    window.addEventListener('mouseup', () => {
      this.setState({ mouseIsDown: false });
    });
  }

  render() {

    const keypad = {
      height: '50px',
      width: '100%'
    };

    const keypad__button = {
      border: '1px solid #000',
      position: 'absolute',
      display: 'block',
      minWidth: 0,
      width: '33.333%',
      height: '24px',
    };

    const keypad__up = Object.assign({}, keypad__button, {
      left: '33.333%'
    });

    const keypad__down = Object.assign({}, keypad__button, {
      top: '25px',
      left: '33.333%',
    });

    const keypad__left = Object.assign({}, keypad__button, {
      top: '25px'
    });

    const keypad__right = Object.assign({}, keypad__button, {
      top: '25px',
      left: '66.667%',
    });

    return (
      <div className="UI" ref="UI">

        {/*
        <p>Reticulation:</p>

        <input
          type="range"
          onInput={this.props.controls.reticulate}
          defaultValue={this.props.d} min="2" max="15"
        /> */}

        <button
          onClick={this.props.controls.morph}
        >Morph</button>

        <button
          onClick={this.props.controls.restore}
        >Restore</button>

        <div style={keypad}>
          <button ref="rotateYZPlus" style={keypad__up}>&uarr;</button>
          <button ref="rotateYZMinus" style={keypad__down}>&darr;</button>
          <button ref="rotateXYPlus" style={keypad__left}>&larr;</button>
          <button ref="rotateXYMinus" style={keypad__right}>&rarr;</button>
        </div>
      </div>
    );
  }
}

UI.propTypes = {
  controls: PropTypes.shape({
    reticulate: PropTypes.func.isRequired,
    restore: PropTypes.func.isRequired,
    rotate: PropTypes.func.isRequired,
  }).isRequired
};

export default UI;
