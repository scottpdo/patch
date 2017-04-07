import React, { Component, PropTypes } from 'react';

import '../css/ui.css';

class UIComponent extends Component {
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
          onClick={this.props.controls.fullControls}
        >Full Controls</button>
      </div>
    );
  }
}

UIComponent.propTypes = {
  controls: PropTypes.shape({
    reticulate: PropTypes.func.isRequired,
    restore: PropTypes.func.isRequired,
    rotate: PropTypes.func.isRequired,
  }).isRequired
};

export default UIComponent;
