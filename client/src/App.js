import React from 'react';
import { BrowserRouter as Router, Switch } from 'react-router-dom';
import 'purecss/build/pure-min.css';
import { ProvideAuth } from './auth';
import RouteWrapper from './layout';
import { ProvideStore } from './store';
import './App.css';
import Home from './Home';
import Login from './Login';
import Logout from './Logout';
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
                    <Switch>
                        <RouteWrapper exact path="/login">
                            <Login />
                        </RouteWrapper>
                        <RouteWrapper exact path="/logout">
                            <Logout />
                        </RouteWrapper>
                        <RouteWrapper exact path="/" privateRoute>
                            <Home />
                            <AddSchool />
                        </RouteWrapper>
                        <RouteWrapper exact path="/school" privateRoute>
                            <TeamList />
                            <hr />
                            <AddTeam />
                        </RouteWrapper>
                        <RouteWrapper exact path="/rounds" privateRoute>
                            <TeamRounds />
                            <AddRound />
                        </RouteWrapper>
                        <RouteWrapper path="/:caselist" privateRoute>
                            <Home />
                        </RouteWrapper>
                    </Switch>
                </ProvideStore>
            </Router>
        </ProvideAuth>
    );
};

export default App;
