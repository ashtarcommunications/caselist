import React from 'react';
import { BrowserRouter as Router, Switch } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'purecss/build/pure-min.css';
import 'react-toastify/dist/ReactToastify.min.css';
import { ProvideAuth } from './helpers/auth';
import RouteWrapper from './layout/layout';
import Breadcrumbs from './layout/Breadcrumbs';
import { ProvideStore } from './helpers/store';
import './App.css';
import Home from './home/Home';
import CaselistHome from './caselist/CaselistHome';
import Recent from './caselist/Recent';
import Login from './login/Login';
import Logout from './login/Logout';
import AddSchool from './caselist/AddSchool';
import TeamList from './school/TeamList';
import AddTeam from './school/AddTeam';
import TeamRounds from './team/TeamRounds';
import AddRound from './team/AddRound';

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
                        <RouteWrapper path="/:caselist/:school/:team/add" privateRoute>
                            <Breadcrumbs />
                            <AddRound />
                        </RouteWrapper>
                        <RouteWrapper path="/:caselist/:school/:team/:side?" privateRoute>
                            <Breadcrumbs />
                            <TeamRounds />
                        </RouteWrapper>
                        <RouteWrapper path="/:caselist/:school" privateRoute>
                            <Breadcrumbs />
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
            <ToastContainer />
        </ProvideAuth>
    );
};

export default App;
