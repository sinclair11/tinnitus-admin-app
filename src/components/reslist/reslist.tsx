import React from 'react';
import './_reslist.sass';

type ReslistProps = {
	entries?: { name: string; data: any }[];
	selectFromList?: any;
};

export const Reslist: React.FC<ReslistProps> = (props: ReslistProps) => {
	/**
	 *
	 * @param name
	 */
	function itemSelected(name: string): void {
		//Pass selected item to parent
		if (props.selectFromList !== undefined) {
			props.selectFromList(name);
		}
	}

	return (
		<ul className="ListView">
			{props.entries.map((item, index) => (
				<li
					key={index}
					tabIndex={-1}
					onClick={(): void => itemSelected(item.name)}
				>
					<div className="ListItem">
							<img src={`data:image/png;base64,${item.data.thumb}`} className="ListItemThumb"/>
						<div className="ListItemInfo">
							<h4>{item.name}</h4>
							<p>
								{'Creare: ' +
									item.data.creation +
									' ' +
									'Upload: ' +
									item.data.upload}
							</p>
						</div>
					</div>
				</li>
			))}
		</ul>
	);
};
