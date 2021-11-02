import React from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { StoreContext, useStore } from './store';
import { addSchool } from './api';
import StatesDropdown from './StatesDropdown';

const AddSchool = () => {
    const { caselist } = useParams();
    const store = useStore(StoreContext);

    const { register, formState: { errors }, handleSubmit } = useForm();

    const addSchoolHandler = async (data) => {
        try {
            await addSchool(caselist, { display_name: data.name });
            toast.success('Successfully added school');
        } catch (err) {
            console.log(err);
        }
    };

    const notTitleCase = /\b[a-z]/;
    const alpha = /^[a-zA-Z ]+$/;

    return (
        <div>
            <h1>Add a school to {store.caselist?.name}</h1>
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
                    &quot;Academy&quot;, &quot;School&quot;, etc. We know it&apos;s a school.
                </li>
                <li>
                    Use Title Case, e.g. &quot;North Lincoln,&quot; not &quot;north lincoln&quot;.
                </li>
                <li>Only add one instance of each school.</li>
                <li>
                    If a school with the same name exists in another state, add your state
                    code at the end, like &quot;Lincoln MN&quot;.
                </li>
            </ul>
            <p>
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
                                )
                                    || 'Invalid school name, do not include words like "HS" or "High School"',
                                titleCase: v => !notTitleCase.test(v) || 'School name should be title case',
                                alpha: v => alpha.test(v) || 'Only letters allowed',
                                length: v => v.length === v.trim().length || 'No leading/trailing spaces allowed',
                            },
                        }
                    )}
                />
                {errors.name?.type === 'required' && <p>This field is required</p>}
                {errors.name?.type === 'minLength' && <p>At least 3 characters</p>}
                {errors.name?.type === 'maxLength' && <p>Max 255 characters</p>}
                {errors.name && <p>{errors.name?.message}</p>}

                {store.caselist?.level === 'hs' && <StatesDropdown emptyOptionText="" />}
                <button type="submit" className="pure-button pure-button-primary">Add</button>
            </form>
        </div>
    );
};

export default AddSchool;
