import React from 'react';
import './App.css';
import Header from './Header';
import Sidebar from './Sidebar';

function App() {
    return (
        <div>
            <Header />
            <div className="wrapper">
                <Sidebar />
                <main className="main">
                    <p>Caselist</p>
                </main>
            </div>
        </div>
    );
}

export default App;
