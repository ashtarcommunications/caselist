import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';
import Header from './Header';
import Sidebar from './Sidebar';
import AddSchool from './AddSchool';
import TeamList from './TeamList';
import AddTeam from './AddTeam';

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
                                <AddSchool />
                            </Route>
                            <Route exact path="/school">
                                <TeamList />
                                <AddTeam />
                            </Route>
                        </Switch>
                    </main>
                </div>
            </div>
        </Router>
    );
}

export default App;
