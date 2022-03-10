import React from 'react';
import { affName, negName } from '../helpers/common';

const SideDropdown = ({ value, onChange, event = 'cx' }) => {
    return (
        <select name="side" value={value} onChange={onChange}>
            <option value="" />
            <option value="A">{affName(event)}</option>
            <option value="N">{negName(event)}</option>
        </select>
    );
};

export default SideDropdown;
