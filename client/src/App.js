import React from 'react';
import { BrowserRouter as Router, Switch } from 'react-router-dom';
import 'purecss/build/pure-min.css';
import { ProvideAuth } from './auth';
import RouteWrapper from './layout';
import { ProvideStore } from './store';
import './App.css';
import Home from './Home';
import CaselistHome from './CaselistHome';
import Recent from './Recent';
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
                        <RouteWrapper exact path="/">
                            <Home />
                        </RouteWrapper>
                        <RouteWrapper exact path="/donate" privateRoute>
                            <h2>Donate</h2>
                        </RouteWrapper>
                        <RouteWrapper path="/:caselist/add" privateRoute>
                            <AddSchool />
                        </RouteWrapper>
                        <RouteWrapper path="/:caselist/recent" privateRoute>
                            <Recent />
                        </RouteWrapper>
                        <RouteWrapper path="/:caselist/:school/:team/:side?" privateRoute>
                            <TeamRounds />
                            <hr />
                            <AddRound />
                        </RouteWrapper>
                        <RouteWrapper path="/:caselist/:school" privateRoute>
                            <TeamList />
                            <hr />
                            <AddTeam />
                        </RouteWrapper>
                        <RouteWrapper path="/:caselist" privateRoute>
                            <CaselistHome />
                        </RouteWrapper>
                    </Switch>
                </ProvideStore>
            </Router>
        </ProvideAuth>
    );
};

export default App;
