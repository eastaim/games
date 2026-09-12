import { MAX_NAME_LENGTH, readPlayer, savePlayer } from '../core/player';
import type { Player } from '../core/player';

/**
 * The header's player control: shows who is playing and opens a rename dialog.
 *
 * A `<dialog>` rather than a hand-rolled overlay — `showModal()` brings the
 * focus trap, the backdrop and Esc-to-close with it, none of which is worth
 * reimplementing.
 */

export interface PlayerChip {
  readonly element: HTMLElement;
  /** Redraws the label from storage; call after anything that may rename. */
  refresh(): void;
}

interface Options {
  /** Called after a successful save so the list can redraw with the new name. */
  readonly onChange: (player: Player) => void;
}

function buildDialog(): {
  dialog: HTMLDialogElement;
  form: HTMLFormElement;
  input: HTMLInputElement;
  error: HTMLElement;
} {
  const dialog = document.createElement('dialog');
  dialog.className = 'dialog';

  const form = document.createElement('form');
  form.className = 'dialog__form';
  // `method="dialog"` would close before the handler validates, so submission
  // is handled in script instead.

  const title = document.createElement('h2');
  title.className = 'dialog__title';
  title.textContent = '이름';

  const hint = document.createElement('p');
  hint.className = 'dialog__hint';
  hint.textContent = '게임 기록에 남는 이름입니다. 이 기기에만 저장됩니다.';

  const input = document.createElement('input');
  input.className = 'dialog__input';
  input.type = 'text';
  input.maxLength = MAX_NAME_LENGTH;
  input.setAttribute('autocomplete', 'nickname');
  input.placeholder = '예: 플레이어1';

  const error = document.createElement('p');
  error.className = 'dialog__error';
  error.setAttribute('role', 'alert');
  error.hidden = true;

  const actions = document.createElement('div');
  actions.className = 'dialog__actions';

  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'button button--quiet';
  cancel.textContent = '취소';
  cancel.addEventListener('click', () => dialog.close());

  const save = document.createElement('button');
  save.type = 'submit';
  save.className = 'button';
  save.textContent = '저장';

  actions.append(cancel, save);
  form.append(title, hint, input, error, actions);
  dialog.append(form);
  return { dialog, form, input, error };
}

export function createPlayerChip(options: Options): PlayerChip {
  const { dialog, form, input, error } = buildDialog();

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'player-chip';

  const element = document.createElement('div');
  element.append(button, dialog);

  const refresh = (): void => {
    const player = readPlayer();
    button.textContent = player === null ? '이름 설정' : player.name;
    button.setAttribute(
      'aria-label',
      player === null ? '이름 설정하기' : `이름 변경 (현재 ${player.name})`,
    );
  };

  button.addEventListener('click', () => {
    input.value = readPlayer()?.name ?? '';
    error.hidden = true;
    dialog.showModal();
    input.select();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const saved = savePlayer(input.value);
    if (saved === null) {
      error.textContent = '이름을 한 글자 이상 입력해주세요.';
      error.hidden = false;
      input.focus();
      return;
    }
    dialog.close();
    refresh();
    options.onChange(saved);
  });

  refresh();
  return { element, refresh };
}
