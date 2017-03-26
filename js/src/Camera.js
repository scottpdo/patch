import Point from './Point';

/**
 * Sets up a Camera from a location and target.
 * @param {Point} location - The location of the Camera.
 * @param {Point} direction - The direction of the Camera.
 */
function Camera(location, direction) {
    this.location = location;
    this.direction = direction;
}

export default Camera;
