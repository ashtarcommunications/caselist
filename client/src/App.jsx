import React from 'react';

import 'purecss/build/pure-min.css';
import 'react-toastify/dist/ReactToastify.min.css';
import './App.css';

import { Router, Switch, Route } from 'wouter';
import { useBrowserLocation } from 'wouter/use-browser-location';
import { ToastContainer } from 'react-toastify';

import { ProvideAuth } from './helpers/auth';
import { ProvideStore } from './helpers/store';
import useScript from './helpers/useScript.js';

import Layout from './layout/Layout';
import ScrollToTopOrAnchor from './layout/ScrollToTopOrAnchor.js';
import ErrorBoundary from './layout/ErrorBoundary';
import Error from './layout/Error';

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
	useScript(import.meta.env.VITE_ANALYTICS_URL, {
		domain: import.meta.env.VITE_DOMAIN,
	});

	return (
		<ProvideAuth>
			{/* <ScrollToTopOrAnchor history={history} /> */}
			<ScrollToTopOrAnchor />
			<ProvideStore>
				<ErrorBoundary>
					<Router hook={useBrowserLocation}>
						<Switch>
							<Route path="/">
								<Layout>
									<Home />
								</Layout>
							</Route>
							<Route path="/login">
								<Layout>
									<Login />
								</Layout>
							</Route>
							<Route path="/logout">
								<Logout />
							</Route>
							<Route path="/faq">
								<Layout>
									<Markdown file={FAQ} />
								</Layout>
							</Route>
							<Route path="/history">
								<Layout>
									<Markdown file={History} />
								</Layout>
							</Route>
							<Route path="/privacy">
								<Layout>
									<Markdown file={PrivacyPolicy} />
								</Layout>
							</Route>
							<Route path="/terms">
								<Layout>
									<Markdown file={Terms} />
								</Layout>
							</Route>
							<Route path="/openev/:year/upload">
								<Layout privateRoute openev>
									<OpenEvUpload />
								</Layout>
							</Route>
							<Route path="/openev/:year/search">
								<Layout privateRoute openev>
									<SearchResults />
								</Layout>
							</Route>
							<Route path="/openev/:year/:tag">
								<Layout privateRoute openev>
									<OpenEvHome />
								</Layout>
							</Route>
							<Route path="/openev/:year">
								<Layout privateRoute openev>
									<OpenEvHome />
								</Layout>
							</Route>
							<Route path="/openev">
								<Layout privateRoute openev>
									<OpenEvHome />
								</Layout>
							</Route>
							<Route path="/:caselist/:school/:team/edit/:round">
								<Layout privateRoute>
									<EditRound />
								</Layout>
							</Route>
							<Route path="/:caselist/:school/:team/add">
								<Layout privateRoute>
									<AddRound />
								</Layout>
							</Route>
							<Route path="/:caselist/:school/:team/:side?">
								<Layout privateRoute>
									<TeamRounds />
								</Layout>
							</Route>
							<Route path="/:caselist/add">
								<Layout privateRoute>
									<AddSchool />
								</Layout>
							</Route>
							<Route path="/:caselist/recent">
								<Layout privateRoute>
									<Recent />
								</Layout>
							</Route>
							<Route path="/:caselist/downloads">
								<Layout privateRoute>
									<Downloads />
								</Layout>
							</Route>
							<Route path="/:caselist/search">
								<Layout privateRoute>
									<SearchResults />
								</Layout>
							</Route>
							<Route path="/:caselist/:school">
								<Layout privateRoute>
									<TeamList />
								</Layout>
							</Route>
							<Route path="/:caselist">
								<Layout privateRoute>
									<CaselistHome />
								</Layout>
							</Route>
							<Route>
								<Error is404 />
							</Route>
						</Switch>
					</Router>
				</ErrorBoundary>
			</ProvideStore>
			<ToastContainer />
		</ProvideAuth>
	);
};

export default App;
