import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import Combobox from 'react-widgets/Combobox';
import * as mammoth from 'mammoth/mammoth.browser';
import Turndown from 'turndown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faTrash, faAngleUp, faAngleDown, faPlus } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import Switch from 'react-switch';
import MDEditor from '@uiw/react-md-editor';
import { useStore } from '../helpers/store';
import SideDropdown from './SideDropdown';
import RoundNumberDropdown from './RoundNumberDropdown';
// import MarkdownIt from 'markdown-it';
import { addRound, loadTabroomRounds } from '../helpers/api';
import './AddRound.css';
import { affName, negName } from '../helpers/common';

const AddRound = () => {
    const { caselist, school, team } = useParams();
    const history = useHistory();
    const { register, watch, formState: { errors }, handleSubmit, reset, setValue, control } = useForm({ mode: 'all' });
    const { fields, append, remove } = useFieldArray({ control, name: 'cites' });
    const { fields: pendingCites, append: appendPending, remove: removePending } = useFieldArray({ control, name: 'cites' });

    const { caselist: caselistData } = useStore();

    // Add a default cite
    useEffect(() => {
        if (fields.length < 1) {
            append({ title: '', cites: '', open: false });
        }
    }, [append, fields.length]);

    const watchFields = watch();
    useEffect(() => {
        console.log(watchFields);
    }, [watchFields]);

    const cites = watch('cites');

    // const [cites, setCites] = useState([{}]);

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

    const [files, setFiles] = useState([]);

    const handleResetFiles = () => {
        setFiles([]);
    };

    const onDrop = useCallback((acceptedFiles) => {
        setFiles(acceptedFiles);
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
                    appendPending({ title: markdown.split('\n')[0], cites: m, open: false });
                });
            };
            reader.readAsArrayBuffer(file);
        });
    }, [appendPending]);

    const handleApproveCite = (index) => {
        append(pendingCites[index]);
        removePending(index);
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop, multiple: false, maxFiles: 1, maxSize: 10000000, acceptedFiles: '.docx,.doc,.txt,.rtf,.pdf' });

    return (
        <div>
            <h2>Add a round to {school} {team}</h2>
            <form onSubmit={handleSubmit(addRoundHandler)} className="pure-form pure-form-stacked">
                <div className="form-group">
                    <label htmlFor="tourn">Tournament</label>
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
                                    textField={i => (typeof i === 'string' ? i : `${i.tourn} Round ${i.round} ${i.side === 'A' ? affName(caselistData.event) : negName(caselistData.event)} vs ${i.opponent}`)}
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
                </div>
                <div className="form-group">
                    <label htmlFor="side">Side</label>
                    <Controller
                        control={control}
                        name="side"
                        rules={{ required: true }}
                        render={
                            ({
                                field: { onChange, value },
                            }) => (
                                <SideDropdown
                                    value={value}
                                    onChange={onChange}
                                    event={caselistData?.event}
                                />
                            )
                        }
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="round">Round</label>
                    <Controller
                        control={control}
                        name="round"
                        rules={{ required: true }}
                        render={
                            ({
                                field: { onChange, value },
                            }) => (
                                <RoundNumberDropdown value={value} onChange={onChange} />
                            )
                        }
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="opponent">Opponent</label>
                    <input
                        name="opponent"
                        type="text"
                        {...register('opponent', { required: true })}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="judge">Judge</label>
                    <input
                        name="judge"
                        type="text"
                        {...register('judge', { required: true })}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="report">Round Report</label>
                    <textarea
                        name="report"
                        {...register('report')}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="video">Video URL</label>
                    <input
                        name="video"
                        type="text"
                        {...register('video')}
                    />
                </div>

                <hr />
                <h4>Open Source</h4>
                <div style={{ display: 'flex' }}>
                    <label htmlFor="autodetect-cites">
                        <Controller
                            control={control}
                            name="autodetect-cites"
                            defaultValue
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
                <div>
                    {
                        files.map(file => (
                            <span>
                                <FontAwesomeIcon
                                    icon={faFile}
                                />
                                {file.path}
                                <FontAwesomeIcon
                                    className="trash"
                                    icon={faTrash}
                                    onClick={handleResetFiles}
                                />
                            </span>
                        ))
                    }
                </div>
                <div>
                    {
                        pendingCites.map((item, index) => {
                            return (
                                <React.Fragment key={item.id}>
                                    <div className="citetitle">
                                        <input type="checkbox" {...register(`pendingCites.${index}.approved`)} />
                                        <div className="form-group">
                                            <label htmlFor={item.id}>Cite Title</label>
                                            <input
                                                name="title"
                                                type="text"
                                                {...register(`pendingCites.${index}.title`)}
                                                defaultValue={item.title}
                                            />
                                        </div>
                                        <span className="caret">
                                            <FontAwesomeIcon
                                                icon={
                                                    item.open
                                                    ? faAngleDown
                                                    : faAngleUp
                                                }
                                            />
                                        </span>
                                        <FontAwesomeIcon
                                            icon={faPlus}
                                            onClick={() => handleApproveCite(index)}
                                        />
                                        <FontAwesomeIcon
                                            className="trash"
                                            icon={faTrash}
                                            onClick={() => removePending(index)}
                                        />
                                    </div>
                                    <MDEditor className="hidden" value={item.cites} />
                                </React.Fragment>
                            );
                        })
                    }
                </div>
                <hr />
                <h4>Cites</h4>
                {
                    fields.map((item, index) => {
                        console.log(item);
                        return (
                            <React.Fragment key={item.id}>
                                <div className="citetitle">
                                    <div className="form-group">
                                        <label htmlFor={item.id}>Cite Title</label>
                                        <input
                                            name="title"
                                            type="text"
                                            {...register(`cites.${index}.title`)}
                                            defaultValue={item.title}
                                        />
                                    </div>
                                    <Controller
                                        control={control}
                                        name={`cites.${index}.open`}
                                        render={
                                            ({
                                                field: { onChange, value },
                                            }) => (
                                                <input
                                                    type="checkbox"
                                                    onChange={onChange}
                                                    checked={value}
                                                />
                                            )
                                        }
                                    />
                                    <span className="caret">
                                        <FontAwesomeIcon
                                            icon={
                                                item.open
                                                ? faAngleDown
                                                : faAngleUp
                                            }
                                        />
                                    </span>
                                    <FontAwesomeIcon
                                        className="trash"
                                        icon={faTrash}
                                        onClick={() => remove(index)}
                                    />
                                </div>
                                {
                                    cites[index].open &&
                                    <Controller
                                        control={control}
                                        name={`cites.${index}.cites`}
                                        render={
                                            ({
                                                field: { onChange, value },
                                            }) => (
                                                <MDEditor
                                                    onChange={onChange}
                                                    value={value}
                                                />
                                            )
                                        }
                                    />
                                }
                            </React.Fragment>
                        );
                    })
                }
                <button type="button" onClick={() => append({ title: '', cites: '', open: false })} className="pure-button add-cite">
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
