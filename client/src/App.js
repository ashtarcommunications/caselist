import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';
import Header from './Header';
import Sidebar from './Sidebar';
import TeamList from './TeamList';

function App() {
    return (
        <Router>
            <div>
                <Header />
                <div className="wrapper">
                    <Sidebar />
                    <main className="main">
                        <Switch>
                            <Route exact path="/">
                                <p>Home</p>
                            </Route>
                            <Route exact path="/school">
                                <TeamList />
                            </Route>
                        </Switch>
                    </main>
                </div>
            </div>
        </Router>
    );
}

export default App;
