import React from 'react';

import 'purecss/build/pure-min.css';
import 'react-toastify/dist/ReactToastify.min.css';
import './App.css';

import { unstable_HistoryRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { ProvideAuth } from './helpers/auth';
import { ProvideStore } from './helpers/store';
import { history } from './helpers/api';
import useScript from './helpers/useScript';

import Layout from './layout/Layout';
import ScrollToTopOrAnchor from './layout/ScrollToTopOrAnchor';
import ErrorBoundary from './layout/ErrorBoundary';

import Markdown from './layout/Markdown';
import FAQ from './layout/FAQ.md';
import History from './layout/History.md';
import PrivacyPolicy from './layout/PrivacyPolicy.md';
import Terms from './layout/Terms.md';

import Home from './home/Home';
import CaselistHome from './caselist/CaselistHome';
import Recent from './caselist/Recent';
import Downloads from './caselist/Downloads';
import Login from './login/Login';
import Logout from './login/Logout';
import AddSchool from './caselist/AddSchool';
import TeamList from './school/TeamList';
import TeamRounds from './team/TeamRounds';
import AddRound from './team/AddRound';
import EditRound from './team/EditRound';
import OpenEvHome from './openev/OpenEvHome';
import OpenEvUpload from './openev/OpenEvUpload';
import SearchResults from './search/SearchResults';

const App = () => {
    // Inject analytics script
    useScript(import.meta.env.VITE_ANALYTICS_URL, { domain: import.meta.env.VITE_DOMAIN });

    return (
        <ProvideAuth>
            <Router history={history}>
                <ScrollToTopOrAnchor history={history} />
                <ProvideStore>
                    <ErrorBoundary>
                        <Routes>
                            <Route exact path="/" element={<Layout><Home /></Layout>} />
                            <Route exact path="/login" element={<Layout><Login /></Layout>} />
                            <Route exact path="/logout" element={<Logout />} />
                            <Route exact path="/faq" element={<Layout><Markdown file={FAQ} /></Layout>} />
                            <Route exact path="/history" element={<Layout><Markdown file={History} /></Layout>} />
                            <Route exact path="/privacy" element={<Layout><Markdown file={PrivacyPolicy} /></Layout>} />
                            <Route exact path="/terms" element={<Layout><Markdown file={Terms} /></Layout>} />
                            <Route
                                path="/openev"
                                element={
                                    <Layout privateRoute openev>
                                        <OpenEvHome />
                                    </Layout>
                                }
                            />
                            <Route
                                path="/openev/:year"
                                element={
                                    <Layout privateRoute openev>
                                        <OpenEvHome />
                                    </Layout>
                                }
                            />
                            <Route
                                path="/openev/:year/upload"
                                element={
                                    <Layout privateRoute openev>
                                        <OpenEvUpload />
                                    </Layout>
                                }
                            />
                            <Route
                                path="/openev/:year/search"
                                element={
                                    <Layout privateRoute openev>
                                        <SearchResults />
                                    </Layout>
                                }
                            />
                            <Route
                                path="/openev/:year/:tag"
                                element={
                                    <Layout privateRoute openev>
                                        <OpenEvHome />
                                    </Layout>
                                }
                            />
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
                                path="/:caselist/downloads"
                                element={
                                    <Layout privateRoute>
                                        <Downloads />
                                    </Layout>
                                }
                            />
                            <Route
                                path="/:caselist/search"
                                element={
                                    <Layout privateRoute>
                                        <SearchResults />
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
