import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { displaySide, roundName } from '@speechanddebate/nsda-js-utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import { useDeviceDetect } from '../helpers/mobile';

import CiteEditor from './CiteEditor';

import styles from './AddCite.module.css';

const AddCite = ({ rounds, event, handleAddCite }) => {
    const { school, team } = useParams();
    const [showForm, setShowForm] = useState();
    const { isMobile } = useDeviceDetect();

    const {
        register,
        formState: { isValid },
        handleSubmit,
        reset,
        control,
    } = useForm({
        mode: 'all',
        defaultValues: {
            round_id: null,
            cites: [{ title: '', cites: '', open: true }],
        },
    });

    // Use an array for the cite to make reusing the CiteEditor component easier
    const { fields } = useFieldArray({ control, name: 'cites' });
    const cites = useWatch({ name: 'cites', control });

    const toggleShowForm = () => {
        setShowForm(!showForm);
    };

    const handleSubmitCite = async (data) => {
        try {
            handleAddCite(data);
            reset({}, { keepDefaultValues: true });
            setShowForm(false);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div>
            {
                showForm ?
                    <>
                        <h2>Add cites to {school} {team}</h2>

                        <form onSubmit={handleSubmit(handleSubmitCite)} className={`pure-form pure-form-stacked ${isMobile && styles.mobile}`}>
                            <label htmlFor="selectround">Link to round</label>
                            <select id="selectround" name="round_id" className={styles.selectround} {...register('round_id', { required: true })}>
                                {
                                    rounds.map(r => {
                                        const name = r.tournament === 'All Tournaments'
                                        ? `${r.tournament} ${displaySide(r.side, event)}`
                                        : `${r.tournament} ${roundName(r.round)} ${displaySide(r.side)} vs ${r.opponent}`;
                                        return (
                                            <option value={r.round_id}>
                                                {name}
                                            </option>
                                        );
                                    })
                                }
                            </select>
                            {
                                fields.map((item, index) => {
                                    return (
                                        <CiteEditor
                                            item={item}
                                            index={index}
                                            register={register}
                                            control={control}
                                        />
                                    );
                                })
                            }

                            <div className={styles.buttons}>
                                <button
                                    type="submit"
                                    className={`pure-button ${styles.add}`}
                                    disabled={
                                        !isValid
                                        || cites[0].title?.length < 1
                                        || cites[0].cites?.length < 1
                                    }
                                >
                                    Add Cite
                                </button>
                                <button type="button" className={`pure-button ${styles.cancel}`} onClick={toggleShowForm}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </>
                :
                    <div className={`${styles['add-cite']} ${isMobile && styles.mobile}`}>
                        <button
                            type="button"
                            className={`pure-button ${styles.add}`}
                            onClick={toggleShowForm}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            <span> Add Cite</span>
                        </button>
                    </div>
            }
        </div>
    );
};

AddCite.propTypes = {
    rounds: PropTypes.array,
    event: PropTypes.string,
    handleAddCite: PropTypes.func,
};

export default AddCite;
