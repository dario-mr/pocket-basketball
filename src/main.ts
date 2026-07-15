import './style.css';
import { configureWorld } from './game/Constants';
import { Game } from './game/Game';
import { type GameMode } from './game/Modes';
import { Menu } from './game/ui/Menu';

const canvas = document.querySelector<HTMLCanvasElement>('#game');
const overlay = document.querySelector<HTMLElement>('#overlay');
const pauseButton = document.querySelector<HTMLButtonElement>('#pause-button');
if (!canvas || !overlay || !pauseButton) throw new Error('Game UI is missing.');
const gameCanvas = canvas;
const gear = pauseButton;

let game: Game | null = null;
const menu = new Menu(overlay, {
  onPlay: (mode) => start(mode),
  onResume: () => togglePause(),
  onRestart: () => start(menuMode),
  onMenu: showMenu,
});
let menuMode: GameMode;

const togglePause = (): void => {
  if (!game) return;
  if (game.isPaused) {
    menu.hide();
    game.resume();
    return;
  }
  game.pause();
  menu.showPause();
};

const start = (mode: GameMode): void => {
  game?.destroy();
  menuMode = mode;
  configureWorld(window.innerWidth, window.innerHeight);
  gameCanvas.style.visibility = 'visible';
  gear.classList.add('is-visible');
  menu.hide();
  game = new Game(gameCanvas, mode, togglePause);
};

function showMenu(): void {
  game?.destroy();
  game = null;
  gameCanvas.style.visibility = 'hidden';
  gear.classList.remove('is-visible');
  menu.showMain();
}

gear.addEventListener('click', togglePause);
showMenu();
