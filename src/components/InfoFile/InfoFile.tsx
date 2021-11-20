import React from 'react';
import { useSelector } from 'react-redux';
import { CombinedStates } from '@store/reducers/custom';

type InfoProps = {
	title?: string;
	type: string;
};

export const InfoFile: React.FC<InfoProps> = (props?: InfoProps) => {
	const info =
		props.type === 'general'
			? (useSelector<CombinedStates>(
					(state) => state.resdataReducer.info,
			  ) as { name: string; value: unknown }[])
			: (useSelector<CombinedStates>(
					(state) => state.resdataReducer.usage,
			  ) as { name: string; value: unknown }[]);

	const selected = useSelector<CombinedStates>(
		(state) => state.resdataReducer.selected,
	) as string;

	function initialInfo(): JSX.Element {
		if (selected === '') {
			return (
				<div className="NoSelected">
					<p>
						Selectati o resursa pentru a vedea informatii{' '}
						{props.type === 'general' ? 'generale' : 'de utilizare'}
					</p>
				</div>
			);
		} else {
			return (
				<div className="ListDiv">
					<ul className="InfoList">
						{info.map((item, index) => (
							<li key={index}>
								{item.name}: <b>{item.value}</b>
							</li>
						))}
					</ul>
				</div>
			);
		}
	}

	return (
		<div className="InfoPlaceholder">
			<div className="InfoTitle">
				<h4>{props.title}</h4>
			</div>
			{initialInfo()}
		</div>
	);
};
