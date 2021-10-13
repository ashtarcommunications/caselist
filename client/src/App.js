import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ProvideAuth, PrivateRoute } from './auth';
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
    return (
        <ProvideAuth>
            <Router>
                <div>
                    <Header />
                    <div className="wrapper">
                        <Switch>
                            <Route exact path="/login">
                                <Login />
                            </Route>
                            <PrivateRoute>
                                <Sidebar />
                                <main className="main">
                                    <Switch>
                                        <PrivateRoute exact path="/">
                                            <Home />
                                            <AddSchool />
                                        </PrivateRoute>
                                        <PrivateRoute exact path="/school">
                                            <TeamList />
                                            <AddTeam />
                                        </PrivateRoute>
                                        <PrivateRoute exact path="/rounds">
                                            <TeamRounds />
                                        </PrivateRoute>
                                    </Switch>
                                </main>
                            </PrivateRoute>
                        </Switch>
                    </div>
                </div>
            </Router>
        </ProvideAuth>
    );
}

export default App;
