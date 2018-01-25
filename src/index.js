import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Tab from './tab/Tab';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Tab />, document.getElementById('root'));
registerServiceWorker();
