/* @refresh reload */
import { render } from 'solid-js/web';
import { Main } from './main.tsx';

const root = document.getElementById('root');

if (root) render(() => <Main />, root);
