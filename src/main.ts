import './style.css';
import { configureWorld } from './game/Constants';
import { Game } from './game/Game';

const canvas = document.querySelector<HTMLCanvasElement>('#game');
if (!canvas) throw new Error('Game canvas is missing.');
configureWorld(window.innerWidth, window.innerHeight);
new Game(canvas);
