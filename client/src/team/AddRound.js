import React, { useCallback, useState } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import Combobox from 'react-widgets/Combobox';
import * as mammoth from 'mammoth/mammoth.browser';
import Turndown from 'turndown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faAngleUp, faAngleDown, faPlus } from '@fortawesome/free-solid-svg-icons';
// import Markdown from 'markdown-it';
import { toast } from 'react-toastify';
import Switch from 'react-switch';
import MDEditor from '@uiw/react-md-editor';
import RoundNumberDropdown from './RoundNumberDropdown';
// import MarkdownIt from 'markdown-it';
import { addRound, loadTabroomRounds } from '../helpers/api';
import './AddRound.css';

const AddRound = () => {
    const { caselist, school, team } = useParams();
    const history = useHistory();
    const { register, formState: { errors }, handleSubmit, reset, setValue, control } = useForm({ mode: 'all' });

    const [cites, setCites] = useState([{}]);

    const [rounds, setRounds] = useState([]);
    const [fetchingRounds, setFetchingRounds] = useState(false);

    const fetchRounds = async () => {
        // Don't refetch on subsequent clicks
        if (rounds.length > 0) { return false; }
        try {
            setFetchingRounds(true);
            setRounds(await loadTabroomRounds(window.location.pathname) || []);
            setFetchingRounds(false);
        } catch (err) {
            setFetchingRounds(false);
            setRounds([]);
            console.log(err);
        }
    };
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
                // TODO - this doesn't handle multi-para cards right yet
                const newCites = [...cites];
                arr.forEach((cite) => {
                    const markdown = turndown.turndown(cite);
                    let m = markdown.split('\n');
                    m = m.map(c => {
                        let words = c.split(' ');
                        if (words.length > 200) {
                            words = words.splice(25, words.length - 25, ' AND ');
                        }
                        words = words.join(' ');
                        return words;
                    });
                    m = m.join('\n');
                    newCites.push({ title: markdown.split('\n')[0], cites: m });
                });
                setCites(newCites);
            };
            reader.readAsArrayBuffer(file);
        });
    }, [cites]);

    const { getRootProps, getInputProps } = useDropzone({ onDrop, multiple: false, maxFiles: 1, maxSize: 10000000, acceptedFiles: '.docx,.doc,.txt,.rtf,.pdf' });

    const handleAddCite = () => {
        const newCites = [...cites];
        newCites.push({});
        setCites(newCites);
    };

    const handleDeleteCite = (index) => {
        const newCites = [...cites];
        newCites.splice(index, 1);
        setCites(newCites);
    };

    // const handleSelectAutoDetected = (round) => {
    //     setValue('tourn', round.tourn, { shouldvalidate: true });
    //     setValue('side', round.side, { shouldvalidate: true });
    //     setValue('round', round.round, { shouldvalidate: true });
    //     setValue('opponent', round.opponent, { shouldvalidate: true });
    //     setValue('judge', round.judge, { shouldvalidate: true });
    // };

    // const md = new Markdown();

    return (
        <div>
            <h2>Add a round to {school} {team}</h2>
            <form onSubmit={handleSubmit(addRoundHandler)} className="pure-form pure-form-stacked">
                Tournament
                <br />
                <Controller
                    control={control}
                    name="tourn"
                    rules={{ required: true, minLength: 2 }}
                    render={
                        ({
                            field: { onChange, onBlur, value },
                            fieldState: { invalid },
                        }) => (
                            <Combobox
                                containerClassName={`combo combo-block ${invalid ? 'dirty' : ''}`}
                                busy={fetchingRounds}
                                hideCaret={fetchingRounds || rounds.length < 1}
                                data={rounds}
                                dataKey="id"
                                textField="tourn"
                                hideEmptyPopup
                                filter="contains"
                                value={value}
                                onChange={
                                    e => {
                                        if (typeof e === 'string') { return onChange(e); }
                                        setValue('side', e.side, { shouldValidate: true });
                                        setValue('round', e.round, { shouldValidate: true });
                                        setValue('opponent', e.opponent, { shouldValidate: true });
                                        setValue('judge', e.judge, { shouldValidate: true });
                                        return onChange(e.tourn);
                                    }
                                }
                                inputProps={
                                    { onFocus: fetchRounds, onBlur }
                                }
                            />
                        )
                    }
                />
                <br />
                <div className="form-group">
                    <label htmlFor="side">Side</label>
                    <input
                        id="side"
                        name="side"
                        type="text"
                        {...register('side', { required: true })}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="round">Round</label>
                    <Controller
                        control={control}
                        name="round"
                        render={
                            ({
                                field: { onChange, value },
                            }) => (
                                <RoundNumberDropdown value={value} onChange={onChange} />
                            )
                        }
                    />
                </div>

                Opponent <input
                    name="opponent"
                    type="text"
                    {...register('opponent', { required: true })}
                />
                Judge <input
                    name="judge"
                    type="text"
                    {...register('judge', { required: true })}
                />
                Round Report <textarea
                    name="report"
                    {...register('report')}
                />
                Video <input
                    name="video"
                    type="text"
                    {...register('video')}
                />
                Open Source
                <div style={{ display: 'flex' }}>
                    <label htmlFor="autodetect-cites">
                        <Controller
                            control={control}
                            name="autodetect-cites"
                            render={
                                ({
                                    field: { onChange, value },
                                }) => (
                                    <Switch
                                        className="switch"
                                        onChange={onChange}
                                        checked={value}
                                        onColor="#8BBF56"
                                        checkedIcon={false}
                                        uncheckedIcon={false}
                                        height={20}
                                        width={40}
                                        id="autodetect-cites"
                                    />
                                )
                            }
                        />
                        <span className="switch-label">Auto-detect cites</span>
                    </label>
                </div>
                <div className="dropzone" {...getRootProps()}>
                    <input {...getInputProps()} />
                    <p>Drag and drop a Verbatim file here, or click to select file</p>
                </div>
                Cites
                {
                    cites.map((c) => {
                        return (
                            <>
                                <div className="citetitle">
                                    <input type="checkbox" />
                                    <input
                                        name="title"
                                        type="text"
                                        placeholder="Cite Title"
                                        {...register('title')}
                                        defaultValue={c.title}
                                    />
                                    <span className="caret">
                                        <FontAwesomeIcon
                                            icon={
                                                c.open
                                                ? faAngleDown
                                                : faAngleUp
                                            }
                                        />
                                    </span>
                                    <FontAwesomeIcon
                                        className="trash"
                                        icon={faTrash}
                                        onClick={e => handleDeleteCite(e)}
                                    />
                                </div>
                                <MDEditor className="hidden" value={c.cites} onChange={() => false} />
                            </>
                        );
                    })
                }
                <button type="button" onClick={handleAddCite} className="pure-button add-cite">
                    <FontAwesomeIcon className="plus" icon={faPlus} />
                    <span> Add Cite</span>
                </button>
                <div className="error">
                    {errors && <p>Errors in form</p>}
                </div>
                <button type="submit" className="pure-button add">Add Round</button>
                <Link to={`/${caselist}/${school}/${team}`}>
                    <button type="button" className="pure-button cancel">Cancel</button>
                </Link>
            </form>
        </div>
    );
};

export default AddRound;
