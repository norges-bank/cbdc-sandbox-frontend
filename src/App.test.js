import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import App from './App';

const history = createMemoryHistory();

// eslint-disable-next-line no-undef
it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <Router history={history}>
      <App />
    </Router>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
