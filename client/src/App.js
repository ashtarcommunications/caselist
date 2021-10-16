import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import 'purecss/build/pure-min.css';
import { ProvideAuth, PrivateRoute } from './auth';
import { ProvideStore } from './store';
import './App.css';
import Home from './Home';
import Login from './Login';
import Logout from './Logout';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import AddSchool from './AddSchool';
import TeamList from './TeamList';
import AddTeam from './AddTeam';
import TeamRounds from './TeamRounds';
import AddRound from './AddRound';

const App = () => {
    return (
        <ProvideAuth>
            <Router>
                <ProvideStore>
                    <div>
                        <Header />
                        <div className="wrapper">
                            <Switch>
                                <Route exact path="/login">
                                    <Login />
                                </Route>
                                <Route exact path="/logout">
                                    <Logout />
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
                                                <hr />
                                                <AddTeam />
                                            </PrivateRoute>
                                            <PrivateRoute exact path="/rounds">
                                                <TeamRounds />
                                                <AddRound />
                                            </PrivateRoute>
                                            <PrivateRoute path="/:caselist">
                                                <Home />
                                            </PrivateRoute>
                                        </Switch>
                                    </main>
                                </PrivateRoute>
                            </Switch>
                        </div>
                        <Footer />
                    </div>
                </ProvideStore>
            </Router>
        </ProvideAuth>
    );
};

export default App;
