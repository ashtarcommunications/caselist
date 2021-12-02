import React, { useCallback, useState } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import * as mammoth from 'mammoth/mammoth.browser';
import Turndown from 'turndown';
import { toast } from 'react-toastify';
import TabroomRoundsDropdown from './TabroomRoundsDropdown';
import RoundNumberDropdown from './RoundNumberDropdown';
// import MarkdownIt from 'markdown-it';
import { addRound } from '../helpers/api';
import './AddRound.css';

const AddRound = () => {
    const { caselist, school, team } = useParams();
    const history = useHistory();
    const { register, formState: { errors }, handleSubmit, reset, setValue } = useForm({ mode: 'all' });

    const [cites, setCites] = useState(['']);

    const addRoundHandler = async (data) => {
        try {
            const response = await addRound(caselist, school, team, data);
            toast.success(response);
            reset();
            history.push(`/${caselist}/${school}/${team}`);
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

    const handleSelectAutoDetected = (round) => {
        setValue('tourn', round.tourn, { shouldvalidate: true });
        setValue('side', round.side, { shouldvalidate: true });
        setValue('round', round.round, { shouldvalidate: true });
        setValue('opponent', round.opponent, { shouldvalidate: true });
        setValue('judge', round.judge, { shouldvalidate: true });
    };

    return (
        <div>
            <h2>Add a round to {school} {team}</h2>
            <form onSubmit={handleSubmit(addRoundHandler)} className="pure-form pure-form-stacked">
                Auto-detected Rounds: <TabroomRoundsDropdown handler={handleSelectAutoDetected} />
                Tournament: <input
                    name="tourn"
                    type="text"
                    {...register('tourn', { required: true })}
                />
                Side: <input
                    name="side"
                    type="text"
                    {...register('side', { required: true })}
                />
                Round: <RoundNumberDropdown register={register} />
                Opponent: <input
                    name="opponent"
                    type="text"
                    {...register('opponent', { required: true })}
                />
                Judge: <input
                    name="judge"
                    type="text"
                    {...register('judge', { required: true })}
                />
                Round Report: <textarea
                    name="report"
                    {...register('report')}
                />
                Video: <input
                    name="video"
                    type="text"
                    {...register('video')}
                />
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
                <div className="error">
                    {errors && <p>Errors in form</p>}
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
