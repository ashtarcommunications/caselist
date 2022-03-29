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
import Toggle from 'react-toggle';
import MDEditor from '@uiw/react-md-editor';
import { useStore } from '../helpers/store';
import SideDropdown from './SideDropdown';
import RoundNumberDropdown from './RoundNumberDropdown';
// import MarkdownIt from 'markdown-it';
import { addRound, loadTabroomRounds } from '../helpers/api';
import './AddRound.css';
import { affName, negName } from '../helpers/common';
import Loader from '../loader/Loader';

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
            append({ title: '', cites: '', open: true });
        }
    }, [append, fields.length]);

    const watchFields = watch();
    useEffect(() => {
        // console.log(watchFields);
    }, [watchFields]);

    const cites = watch('cites');

    const [processing, setProcessing] = useState(false);
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
                // Show processing indicator
                setProcessing(true);

                // Convert the file contents into HTML
                const binaryStr = reader.result;
                const result = await mammoth.convertToHtml({
                    arrayBuffer: binaryStr,
                    ignoreEmptyParagraphs: true,
                });
                const html = result.value;

                // Put the HTML string into a DOM element so we can manipulate as an array
                const div = document.createElement('div');
                div.innerHTML = html;
                const elements = [...div.children];

                // Combine <p> tags so each cite + card is in one element
                // Iterates through array backwards, merges <p> into previous element if also a <p>
                for (let i = elements.length - 1; i >= 0; i--) {
                    if (elements[i].tagName === 'P' && elements[i - 1] && elements[i - 1].tagName === 'P') {
                        elements[i - 1].innerHTML = `${elements[i - 1].innerHTML}<br>${elements[i].innerHTML}`;
                        elements.splice(i, 1);
                    }
                }

                // Truncate the text of each card to keep them readable
                elements.forEach(e => {
                    // Skip headers, we only want to deal with the card text
                    if (e.tagName !== 'P') { return false; }

                    // Convert the cite + card text into an array of paragraphs
                    // so we can identify the cite vs the card
                    const paragraphs = e.innerHTML.split('<br>');

                    // If there's less than 2 paragraphs, something is off and we don't have
                    // a cite + card, so abort
                    if (paragraphs.length < 2) { return false; }

                    // Most people use 2-line cites, so default to card starting on 3rd paragraph
                    let startOfCardIndex = 2;

                    // If there are exactly two paragraphs, the first is almost always the cite,
                    // so truncate the second paragraph as the card
                    if (paragraphs.length === 2) {
                        startOfCardIndex = 1;
                    }

                    // If the first paragraph has a URL, it's probably a one-line cite
                    if (paragraphs[0].indexOf('http://') !== -1
                        || paragraphs[0].indexOf('https://') !== -1
                    ) {
                        startOfCardIndex = 1;
                    }

                    // If the first paragraph has more than one double quote,
                    // it's probably a one line cite
                    if ((paragraphs[0].match(/"/g) || []).length > 1
                        || (paragraphs[0].match(/”/g) || []).length > 1
                    ) {
                        startOfCardIndex = 1;
                    }

                    // Truncate the full card text to 25 words start/end
                    let fullText = paragraphs.slice(startOfCardIndex).join(' ');
                    const words = fullText.split(' ');
                    if (words.length > 50) {
                        fullText = words
                            .slice(0, 25)
                            .join(' ')
                            .concat('<br />AND<br />')
                            .concat(words.slice(-25).join(' '));
                    }

                    // Replace the card text with the truncated cite version and delete
                    // the rest of the paragraphs
                    paragraphs[startOfCardIndex] = fullText;
                    paragraphs.length = startOfCardIndex + 1;

                    // Put the card back together into the DOM element
                    e.innerHTML = paragraphs.join('<br>');
                });

                // Convert the array of elements back to a string so we can split it into entries
                const citeEntries = elements
                    .map(e => e.outerHTML)
                    .join('')
                    .split('<h1>')
                    .map(x => `<h1>${x}`)
                    .filter(x => x !== '<h1>');

                // Convert each entry into markdown
                citeEntries.forEach((entry) => {
                    const markdown = turndown.turndown(entry);
                    appendPending({ title: markdown.split('\n')[0].replace('#', '').trim(), cites: markdown, open: false });
                });

                // Stop showing processing indicator
                setProcessing(false);
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
                                    <Toggle
                                        className="switch"
                                        onChange={onChange}
                                        checked={value}
                                        onColor="#8BBF56"
                                        checkedIcon={false}
                                        uncheckedIcon={false}
                                        height={20}
                                        width={40}
                                        id="autodetect-cites"
                                        name="autodetect-cites"
                                        value='yes'
                                        icons={false}
                                        aria-label="autodetect-cites"
                                    />
                                )
                            }
                        />
                        <span className="switch-label">Auto-detect cites</span>
                    </label>
                </div>
                <div className="dropzone" {...getRootProps()}>
                    {
                        processing
                        ? <Loader />
                        :
                        <div>
                            <input {...getInputProps()} />
                            <p>Drag and drop a Verbatim file here, or click to select file</p>
                        </div>
                    }
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
                                    cites[index]?.open &&
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
