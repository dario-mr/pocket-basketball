import { GAME_MODES, GameMode, loadMode, saveMode } from '../state/Modes';

type MenuActions = Readonly<{
  onPlay: (mode: GameMode) => void;
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
}>;

export class Menu {
  private selected = loadMode();

  constructor(
    private readonly root: HTMLElement,
    private readonly actions: MenuActions,
  ) {
    saveMode(this.selected);
  }

  hide(): void {
    this.root.classList.remove('is-visible');
  }

  showMain(): void {
    this.root.innerHTML = `
      <main class="menu menu--main" aria-label="Pocket Basketball menu">
        <h1>POCKET<span>BASKETBALL</span></h1>
        <div class="mode-options">
          ${GAME_MODES.map((mode) => this.modeButton(mode.id, mode.title, mode.description)).join('')}
        </div>
        <button class="play-button" type="button">PLAY</button>
      </main>`;
    this.root.classList.add('is-visible');
    this.root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => {
      button.addEventListener('click', () => {
        this.selected = button.dataset.mode as GameMode;
        saveMode(this.selected);
        this.showMain();
      });
    });
    const playButton = this.root.querySelector<HTMLButtonElement>('.play-button');
    playButton?.addEventListener('click', () => {
      this.actions.onPlay(this.selected);
    });
  }

  showPause(): void {
    this.root.innerHTML = `
      <section class="menu menu--pause" aria-label="Game paused">
        <p>PAUSED</p>
        <button type="button" data-action="resume">RESUME</button>
        <button type="button" data-action="restart">RESTART</button>
        <button type="button" data-action="menu">BACK TO MENU</button>
      </section>`;
    this.root.classList.add('is-visible');
    this.root.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (action === 'resume') {
          this.actions.onResume();
        }
        if (action === 'restart') {
          this.actions.onRestart();
        }
        if (action === 'menu') {
          this.actions.onMenu();
        }
      });
    });
  }

  private modeButton(id: GameMode, title: string, description: string): string {
    const selected = id === this.selected;
    return `<button class="mode-button${selected ? ' is-selected' : ''}" type="button" data-mode="${id}" aria-pressed="${selected}">
      <strong>${title}</strong><small>${description}</small>
    </button>`;
  }
}
