// tests/helpers/dom.js
// Tiny React-in-jsdom helpers (no testing-library): mount, click, type.

import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

/**
 * Mount `element` into the document and return { container, unmount }.
 * `container` is document.body: modals render in a portal on <body>, so queries must start
 * there to find them (unmount removes everything this call mounted).
 */
export function mount(element) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => root.render(element));
  const unmount = () => {
    act(() => root.unmount());
    host.remove();
  };
  return { container: document.body, unmount };
}

/** Click an element inside act(). */
export function click(el) {
  act(() => { el.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
}

/** Set an input's value the way a user typing would (React tracks the setter). */
export function type(input, value) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  act(() => {
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

/** Wait for pending promises (and the state updates they trigger). */
export async function flush() {
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
}

/** Find a button by its visible text. */
export function buttonByText(root, text) {
  return [...root.querySelectorAll('button')].find((b) => b.textContent.trim() === text);
}
