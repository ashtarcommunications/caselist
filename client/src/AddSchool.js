import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useStore } from './store';
import { addSchool } from './api';
import StatesDropdown from './StatesDropdown';
import './AddSchool.css';

const AddSchool = () => {
    const history = useHistory();
    const { caselist } = useParams();
    const { caselist: caselistData, fetchSchools } = useStore();

    const { register, formState: { errors }, handleSubmit, reset } = useForm({ mode: 'all' });

    const addSchoolHandler = async (data) => {
        try {
            await addSchool(caselist, { display_name: data.name });
            fetchSchools(caselist);
            reset();
            toast.success('Successfully added school');
            // TODO - use the returned slug, not the display name
            history.push(`/${caselist}/${data.name}`);
        } catch (err) {
            console.log(err);
            toast.error(err.message);
        }
    };

    const notTitleCase = /\b[a-z]/;
    const alpha = /^[a-zA-Z ]+$/;

    return (
        <div className="instructions">
            <h1>Add a school to {caselistData.name}</h1>
            <p>
                Use the form below to add a school to the caselist. School names should conform
                to the following rules:
            </p>
            <ul>
                <li>
                    Use the shortest name that uniquely identifies the school,
                    e.g. &quot;Lincoln&quot; not &quot;The Lincoln Academy For Very
                    Smart Children&quot;
                </li>
                <li>
                    Do not include words like &quot;High School&quot;, &quot;HS&quot;,
                    &quot;Academy&quot;, &quot;School&quot;, etc. - we know it&apos;s a school
                </li>
                <li>
                    Use Title Case, e.g. &quot;North Lincoln,&quot; not &quot;north lincoln&quot;
                </li>
                <li>Only add one instance of each school</li>
                <li>
                    If a school with the same name exists in another state, add your state
                    code at the end, like &quot;Lincoln MN&quot;
                </li>
            </ul>
            <p className="error">
                Abusing the wiki (e.g. posting joke schools, using profanity, purposefully
                breaking the above rules, etc.) will not be tolerated and may result in
                banning. Please note that everything you do on the site is logged.
            </p>
            <form onSubmit={handleSubmit(addSchoolHandler)} className="pure-form pure-form-stacked">
                School Name:
                <input
                    id="name"
                    type="text"
                    {...register(
                        'name',
                        {
                            required: true,
                            minLength: 3,
                            maxLength: 255,
                            validate: {
                                noHs: v => (
                                    v.toLowerCase().indexOf(' hs') === -1
                                    && v.toLowerCase().indexOf(' high') === -1
                                    && v.toLowerCase().indexOf(' university') === -1
                                    && v.toLowerCase().indexOf(' college') === -1
                                )
                                    || 'Invalid school name, use a short version without a school designation',
                                titleCase: v => !notTitleCase.test(v) || 'School name should be title case',
                                alpha: v => alpha.test(v) || 'Only letters allowed',
                                length: v => v.length === v.trim().length || 'No leading/trailing spaces allowed',
                            },
                        }
                    )}
                />
                <div className="error">
                    {errors.name?.type === 'required' && <p>This field is required</p>}
                    {errors.name?.type === 'minLength' && <p>At least 3 characters</p>}
                    {errors.name?.type === 'maxLength' && <p>Max 255 characters</p>}
                    {errors.name && <p>{errors.name?.message}</p>}
                </div>

                {caselistData.level === 'hs' && <StatesDropdown emptyOptionText="" />}
                <button type="submit" className="green pure-button" disabled={errors.name}>Add</button>
            </form>
        </div>
    );
};

export default AddSchool;
