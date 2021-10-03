import React from 'react';

type InfoProps = {
	title?: string;
	className?: string;
	elements?: Array<{ name: string; value: unknown }>;
};

export const InfoFile: React.FC<InfoProps> = (props?: InfoProps) => {
	return (
		<div className={'InfoPlaceholder ' + props.className}>
			<div className="InfoTitle">
				<h4>{props.title}</h4>
			</div>
			<div className="ListDiv">
				<ul className="InfoList">
					{props.elements.map((item, index) => (
						<li key={index}>
							{item.name}: <b>{item.value}</b>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};
