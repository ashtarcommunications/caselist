import React from 'react';
import Cookies from 'js-cookie';
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
    const token = Cookies.get('caselist_token');
    console.log(token);
    if (!token || typeof token !== 'string') {
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
