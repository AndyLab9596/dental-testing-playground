import { SIDE } from "../enums/side.enum";

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

const MAP_SIDE_DEGREE = {
    [SIDE.LEFT]: 45,
    [SIDE.RIGHT]: -45
};

export { MAP_SIDE_DEGREE, MAX_ZOOM, MIN_ZOOM, ZOOM_STEP };
 