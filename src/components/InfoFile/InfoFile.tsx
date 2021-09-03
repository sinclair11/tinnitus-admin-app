import React from 'react';
import './infofile.css'

type InfoProps = {
    title?: string;
    className?: string;
    elements?: Array<{ name: string, value: unknown }>
}


export const InfoFile: React.FC<InfoProps> = (props?: InfoProps) => {

    console.log(props.elements)

    return (
        <div className={"InfoPlaceholder " + props.className}>
            <div className="InfoTitle">
                <h4>{props.title}</h4>
            </div>
            <div className="ListDiv">
                <ul className="InfoList">
                    {
                        props.elements.map((item, index) =>
                            <li key={index}>{item.name}: <b>{item.value}</b></li>
                        )
                    }
                </ul>
            </div>
        </div>
    )
}
