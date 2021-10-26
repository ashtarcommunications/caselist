import React from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { addSchool } from './api';

const AddSchool = () => {
    const { caselist } = useParams();

    const { register, handleSubmit } = useForm();

    const addSchoolHandler = async (data) => {
        try {
            await addSchool(caselist, { name: data.name, display_name: data.display_name });
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit(addSchoolHandler)} className="pure-form pure-form-stacked">
                School Name: <input id="name" type="text" {...register('name')} />
                Display Name: <input id="display_name" type="text" {...register('display_name')} />
                <button type="submit" className="pure-button pure-button-primary">Add</button>
            </form>
        </div>
    );
};

export default AddSchool;
