import React, { Component, PropTypes } from 'react';

import '../css/ui.css';

class UI extends Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    return (
      <div className="UI">
        <p>Reticulation:</p>
        <input
          type="range"
          onInput={this.props.controls.reticulate}
          defaultValue={this.props.d} min="2" max="40"
        />
        <button
          onClick={this.props.controls.morph}
        >Morph</button>
        <button
          onClick={this.props.controls.restore}
        >Restore</button>
        <button
          onClick={this.props.controls.rotate}
        >Rotate</button>
        <button
          onClick={this.props.controls.fullControls}
        >Pt. Controls</button>
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
