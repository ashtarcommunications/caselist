import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import * as mammoth from 'mammoth/mammoth.browser';
// import MarkdownIt from 'markdown-it';
import { addRound } from './api';
import './AddRound.css';

const AddRound = () => {
    const { caselist, school, team } = useParams();

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

            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => console.log('file reading has failed');
            reader.onload = async () => {
                // Do whatever you want with the file contents
                const binaryStr = reader.result;
                console.log(binaryStr);
                const result = await mammoth.convertToHtml({ arrayBuffer: binaryStr });
                const html = result.value;
                const arr = html.split('<h1>').map(x => `<h1>${x}`).filter(x => x !== '<h1>');
                // const md = new MarkdownIt();
                // const json = md.parse(result.value, {});
                console.log(result.value);
                console.log(arr);
                // console.log(json);
            };
            reader.readAsArrayBuffer(file);
        });
    }, []);
    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    return (
        <div>
            <form onSubmit={addRoundHandler} className="pure-form pure-form-stacked">
                Tournament: <input type="text" />
                Round: <input type="text" />
                Opponent: <input type="text" />
                Judge: <input type="text" />
                Round Report: <input type="text" />
                Video: <input type="text" />
                Cites: <input type="text" />
                <button type="submit" className="pure-button pure-button-primary">Add</button>
            </form>
            <div className="dropzone" {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drag and drop some files here, or click to select files</p>
            </div>
        </div>
    );
};

export default AddRound;
