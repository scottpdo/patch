import React from 'react';

import '../css/ui.css';

class UIComponent extends React.Component {
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
          onClick={this.props.controls.animate}
          disabled={this.props.animating}
        >Animate
        </button>
        <button
          onClick={this.props.controls.restore}
          disabled={this.props.animating}
        >Restore</button>
        <button
          onClick={this.props.controls.rotate}
          disabled={this.props.animating}
        >Rotate</button>
      </div>
    );
  }
}

export default UIComponent;
