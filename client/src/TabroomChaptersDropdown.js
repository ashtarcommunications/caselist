import React, { useState } from 'react';
import { loadTabroomChapters } from './api';

const TabroomChaptersDropdown = () => {
    const [chapters, setChapters] = useState([]);

    const fetchChapters = async () => {
        // Don't refetch on subsequent clicks
        if (chapters.length > 0) { return false; }
        try {
            setChapters(await loadTabroomChapters() || []);
        } catch (err) {
            console.log(err);
            setChapters([]);
        }
    };

    const handleChangeChapter = (e) => {
        e.preventDefault();
    };

    return (
        <div>
            <form className="form pure-form">
                <select
                    onBlur={fetchChapters}
                    onClick={fetchChapters}
                    onChange={handleChangeChapter}
                >
                    <option value="">Choose a School</option>
                    {
                        chapters.length > 0
                        ? chapters.map(c => {
                            return (
                                <option
                                    key={c.id}
                                    value={c.id}
                                >
                                    {c.name}
                                </option>
                            );
                        })
                        : <option value="">Loading Tabroom schools...</option>
                    }
                </select>
            </form>
        </div>
    );
};

export default TabroomChaptersDropdown;
