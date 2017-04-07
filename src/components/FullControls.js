import React, { Component, PropTypes } from 'react';

import '../css/fullcontrols.css';

class FullControls extends Component {

  constructor() {
    super();
    this.state = {};
    this.update = this.update.bind(this);
    this.increment = this.increment.bind(this);
  }

  update(e) {

    // ignore tabbing
    if (e.keyCode === 9) return;

    const input = e.target;
    const curve = input.getAttribute('data-curve');
    const pt = parseFloat(input.getAttribute('data-pt'));
    const coord = input.getAttribute('data-coord');
    const value = parseFloat(input.value);

    if (isNaN(pt) || isNaN(value)) return;

    this.props.controls.setCurvePt(curve, pt, coord, value);

    if (input.getAttribute('data-also-curve') &&
        input.getAttribute('data-also-point')) {

      const alsoCurve = input.getAttribute('data-also-curve');
      const alsoPt = parseFloat(input.getAttribute('data-also-point'));

      console.log(alsoCurve, alsoPt);

      this.props.controls.setCurvePt(alsoCurve, alsoPt, coord, value);
    }
  }

  increment(e) {
    let r = (v, n) => { return Math.round(10 * ((+v) + n)) / 10; };
    let value = e.target.value;
    if (e.keyCode === 38) e.target.value = r(value, 0.1);
    if (e.keyCode === 40) e.target.value = r(value, -0.1);
    this.update(e);
  }

  render() {

    const curves = this.props.curves;

    let inputs = (curve, pt, alsoCurve, alsoPt) => {

      let input = (which) => {
        // console.log(curve, pt, curves[curve]["pt" + pt]()[which]())
        return (
          <input
            onChange={this.update}
            onKeyDown={this.increment}
            data-curve={curve}
            data-also-curve={alsoCurve}
            data-pt={pt}
            data-also-point={alsoPt}
            data-coord={which}
            defaultValue={curves[curve]["pt" + pt]()[which]()} />
        );
      };

      return (
        <div className="cell">
          {input("x")}
          {input("y")}
          {input("z")}
        </div>
      );
    };

    let emptyCell = <div className="cell"></div>;

    return (
      <div>
        {inputs("u1", 0, "v0", 3)}
        {inputs("u1", 1)}
        {inputs("u1", 2)}
        {inputs("u1", 3, "v1", 3)}

        {inputs("v0", 2)}
        {emptyCell}
        {emptyCell}
        {inputs("v1", 2)}

        {inputs("v0", 1)}
        {emptyCell}
        {emptyCell}
        {inputs("v1", 1)}

        {inputs("u0", 0, "v0", 0)}
        {inputs("u0", 1)}
        {inputs("u0", 2)}
        {inputs("u0", 3, "v1", 0)}
      </div>
    );
  }
}

FullControls.propTypes = {
  controls: PropTypes.shape({
    reticulate: PropTypes.func.isRequired,
    restore: PropTypes.func.isRequired,
    rotate: PropTypes.func.isRequired,
    setCurvePt: PropTypes.func.isRequired,
  }).isRequired
};

export default FullControls;
