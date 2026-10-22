// Logical screen size. Height is fixed (bigger characters on phones); width follows the device aspect so the
// game fills the whole screen (clamped 16:10 .. 21.6:9). BOUNDS_H trims the camera so the ground sits low on screen.
export const H = 600;
export const BOUNDS_H = 15 * 64;   // camera floor: ground line sits at ~68% of the screen, leaving the bottom ~30% for thumbs
export const aspectW = () => Math.round(H * Math.min(2.4, Math.max(1.6, innerWidth / Math.max(1, innerHeight))));
export const W = aspectW();
