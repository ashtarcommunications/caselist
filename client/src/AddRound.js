import React, { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import * as mammoth from 'mammoth/mammoth.browser';
import Turndown from 'turndown';
import TabroomRoundsDropdown from './TabroomRoundsDropdown';
import RoundNumberDropdown from './RoundNumberDropdown';
// import MarkdownIt from 'markdown-it';
import { addRound } from './api';
import './AddRound.css';

const AddRound = () => {
    const { caselist, school, team } = useParams();

    const [cites, setCites] = useState(['']);

    const addRoundHandler = async (e) => {
        e.preventDefault();
        try {
            await addRound(
                caselist,
                school,
                team,
                { side: 'Aff', tournament: 'Test Tournament' });
        } catch (err) {
            console.log(err);
        }
    };

    const onDrop = useCallback((acceptedFiles) => {
        acceptedFiles.forEach((file) => {
            const reader = new FileReader();
            const turndown = new Turndown({ headingStyle: 'atx' });

            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => console.log('file reading has failed');
            reader.onload = async () => {
                const binaryStr = reader.result;
                const result = await mammoth.convertToHtml({ arrayBuffer: binaryStr });
                const html = result.value;
                const arr = html.split('<h1>').map(x => `<h1>${x}`).filter(x => x !== '<h1>');
                // const md = new MarkdownIt();
                // const json = md.parse(result.value, {});
                console.log(result.value);
                console.log(arr);
                const newCites = [...cites];
                arr.forEach((cite) => {
                    const markdown = turndown.turndown(cite);
                    newCites.push(markdown);
                });
                setCites(newCites);
            };
            reader.readAsArrayBuffer(file);
        });
    }, [cites]);

    const { getRootProps, getInputProps } = useDropzone({ onDrop, multiple: false, maxFiles: 1, maxSize: 10000000, acceptedFiles: '.docx,.doc,.txt,.rtf,.pdf' });

    const handleAddCite = () => {
        const newCites = [...cites];
        newCites.push('');
        setCites(newCites);
    };

    const handleDeleteCite = (index) => {
        const newCites = [...cites];
        newCites.splice(index, 1);
        setCites(newCites);
    };

    return (
        <div>
            <form onSubmit={addRoundHandler} className="pure-form pure-form-stacked">
                <TabroomRoundsDropdown />
                Tournament: <input type="text" />
                Side: <input type="text" />
                Round: <RoundNumberDropdown />
                Opponent: <input type="text" />
                Judge: <input type="text" />
                Round Report: <input type="text" />
                Video: <input type="text" />
                Cites:
                {
                    cites.map((c, index) => {
                        return (
                            <>
                                <textarea
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={index}
                                >
                                    {c}
                                </textarea>
                                <button type="button" onClick={() => handleDeleteCite(index)} className="pure-button pure-button-seconday">Remove</button>
                            </>
                        );
                    })
                }
                <button type="button" onClick={handleAddCite} className="pure-button pure-button-secondary">Add A Cite</button>
                <div className="dropzone" {...getRootProps()}>
                    <input {...getInputProps()} />
                    <p>Drag and drop a Verbatim file here, or click to select file</p>
                </div>
                <button type="submit" className="pure-button pure-button-primary">Add</button>
                <Link to={`/${caselist}/${school}/${team}`}>
                    <button type="button" className="pure-button pure-button-primary">Cancel</button>
                </Link>
            </form>
        </div>
    );
};

export default AddRound;
