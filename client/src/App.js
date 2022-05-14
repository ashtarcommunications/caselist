import React from 'react';

import 'purecss/build/pure-min.css';
import 'react-toastify/dist/ReactToastify.min.css';
import './App.css';

import { unstable_HistoryRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { ProvideAuth } from './helpers/auth';
import { ProvideStore } from './helpers/store';
import { history } from './helpers/api';

import Layout from './layout/Layout';
import ScrollToTop from './layout/ScrollToTop';
import ErrorBoundary from './layout/ErrorBoundary';

import Markdown from './layout/Markdown';
import PrivacyPolicy from './layout/PrivacyPolicy.md';
import Terms from './layout/Terms.md';
import Error from './layout/Error';

import Home from './home/Home';
import CaselistHome from './caselist/CaselistHome';
import Recent from './caselist/Recent';
import Login from './login/Login';
import Logout from './login/Logout';
import AddSchool from './caselist/AddSchool';
import TeamList from './school/TeamList';
import TeamRounds from './team/TeamRounds';
import AddRound from './team/AddRound';
import EditRound from './team/EditRound';
import OpenEvHome from './openev/OpenEvHome';

import useScript from './helpers/useScript';

const App = () => {
    // Inject analytics script
    useScript(process.env.REACT_APP_ANALYTICS_URL, { domain: process.env.REACT_APP_DOMAIN });

    return (
        <ProvideAuth>
            <Router history={history}>
                <ScrollToTop history={history} />
                <ProvideStore>
                    <ErrorBoundary>
                        <Routes>
                            <Route exact path="/login" element={<Layout><Login /></Layout>} />
                            <Route exact path="/logout" element={<Logout />} />
                            <Route exact path="/privacy" element={<Layout><Markdown file={PrivacyPolicy} /></Layout>} />
                            <Route exact path="/terms" element={<Layout><Markdown file={Terms} /></Layout>} />
                            <Route
                                path="/openev/*"
                                element={
                                    <Layout privateRoute>
                                        <OpenEvHome />
                                    </Layout>
                                }
                            />
                            <Route exact path="/404" element={<Layout><Error is404 /></Layout>} />
                            <Route exact path="/error" element={<Layout><Error /></Layout>} />
                            <Route exact path="/" element={<Layout><Home /></Layout>} />
                            <Route
                                path="/:caselist/add"
                                element={
                                    <Layout privateRoute>
                                        <AddSchool />
                                    </Layout>
                                }
                            />
                            <Route
                                path="/:caselist/recent"
                                element={
                                    <Layout privateRoute>
                                        <Recent />
                                    </Layout>
                                }
                            />
                            <Route
                                path="/:caselist/:school/:team/add"
                                element={
                                    <Layout privateRoute>
                                        <AddRound />
                                    </Layout>
                                }
                            />
                            <Route
                                path="/:caselist/:school/:team/edit/:round"
                                element={
                                    <Layout privateRoute>
                                        <EditRound />
                                    </Layout>
                                }
                            />
                            <Route
                                path="/:caselist/:school/:team/"
                                element={
                                    <Layout privateRoute>
                                        <TeamRounds />
                                    </Layout>
                                }
                            />
                            <Route
                                path="/:caselist/:school/:team/:side"
                                element={
                                    <Layout privateRoute>
                                        <TeamRounds />
                                    </Layout>
                                }
                            />
                            <Route
                                path="/:caselist/:school"
                                element={
                                    <Layout privateRoute>
                                        <TeamList />
                                    </Layout>
                                }
                            />
                            <Route
                                path="/:caselist"
                                element={
                                    <Layout privateRoute>
                                        <CaselistHome />
                                    </Layout>
                                }
                            />
                        </Routes>
                    </ErrorBoundary>
                </ProvideStore>
            </Router>
            <ToastContainer />
        </ProvideAuth>
    );
};

export default App;
