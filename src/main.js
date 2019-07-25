import ReactDOM from 'react-dom'
import React from 'react';
import './index.less'
import { BrowserRouter, Route } from 'react-router-dom'
import Chat from './components/chat.jsx';
import Login from './components/login.jsx';

ReactDOM.render((
    <BrowserRouter>
        <Route path="/" component={Login} exact />
        <Route path='/login' component={Login}></Route>
        <Route path='/chat' component={Chat}></Route>
    </BrowserRouter>),
    document.getElementById('root'))