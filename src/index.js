import React from 'react'
// import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import * as serviceWorker from './serviceWorker'
import 'bootstrap/dist/css/bootstrap.css';

// ReactDOM.render(<App />, document.getElementById('root'))
// const root = ReactDOM.createRoot(document.getElementById("root"));
import { createRoot } from 'react-dom/client';
const domNode = document.getElementById('root');
const root = createRoot(domNode);
root.render(<App />);
// const root = createRoot(container);
// root.render(element);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()


// import {StrictMode} from 'react';
// import {createRoot} from 'react-dom/client';

// import App from './App'

// // This is the ID of the div in your index.html file

// const rootElement = document.getElementById('root');
// const root = createRoot(rootElement);

// // 👇️ if you use TypeScript, add non-null (!) assertion operator
// const root = createRoot(rootElement!);