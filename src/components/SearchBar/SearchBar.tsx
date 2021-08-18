import React from 'react';
import './searchbar.css'
import { InputGroup, FormControl, Button } from 'react-bootstrap';
// eslint-disable-next-line import/no-unresolved
import magnifier from '../../icons/magnifier.png'


export const SearchBar: React.FC<{id?: string}> = (props: {id: string}) => {
    return (
            <InputGroup className="SearchGroup" id={props.id}>
                <FormControl
                    placeholder="Nume video..."
                    aria-label="Nume video"
                    aria-describedby="basic-addon2"
                    className="SearchBar"
                />
                <Button className="SearchButton">
                    <img src={magnifier} className="SearchIcon"></img>
                </Button>
            </InputGroup>
    )
}