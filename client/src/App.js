import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';
import Home from './Home';
import Login from './Login';
import Header from './Header';
import Sidebar from './Sidebar';
import AddSchool from './AddSchool';
import TeamList from './TeamList';
import AddTeam from './AddTeam';
import TeamRounds from './TeamRounds';

function App() {
    // Check for API credentials or redirect to the login page
    const cookies = `; ${document.cookie}`;
    let token = null;
    const parts = cookies.split('; caselist_token=');
    if (parts.length === 2) {
        token = parts.pop().split(';').shift();
    }

    if (!token || typeof sessionToken !== 'string') {
        return <Login />;
    }

    return (
        <Router>
            <div>
                <Header />
                <div className="wrapper">
                    <Sidebar />
                    <main className="main">
                        <Switch>
                            <Route exact path="/">
                                <Home />
                                <AddSchool />
                            </Route>
                            <Route exact path="/school">
                                <TeamList />
                                <AddTeam />
                            </Route>
                            <Route exact path="/rounds">
                                <TeamRounds />
                            </Route>
                        </Switch>
                    </main>
                </div>
            </div>
        </Router>
    );
}

export default App;
