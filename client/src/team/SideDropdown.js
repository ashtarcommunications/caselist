import React from 'react';
import { affName, negName } from '@speechanddebate/nsda-js-utils';

const SideDropdown = ({ className, value, onChange, event = 'cx' }) => {
    return (
        <select className={className} name="side" value={value} onChange={onChange}>
            <option value="" />
            <option value="A">{affName(event)}</option>
            <option value="N">{negName(event)}</option>
        </select>
    );
};

export default SideDropdown;
