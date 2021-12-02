import React from 'react';

const RoundNumberDropdown = () => {
    return (
        <select>
            <option value="" />
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="Quads">Quads</option>
            <option value="Triples">Triples</option>
            <option value="Doubles">Doubles</option>
            <option value="Octas">Octas</option>
            <option value="Quarters">Quarters</option>
            <option value="Semis">Semis</option>
            <option value="Finals">Finals</option>
        </select>
    );
};

export default RoundNumberDropdown;
