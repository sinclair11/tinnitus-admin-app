import React from 'react'
import './infolog.css'

type InfologProps = {
	messages?: Array<{ type: string; value: unknown }>
}

export const InfoLog: React.FC<InfologProps> = (props: InfologProps) => {
	return (
		<div className="InfologContainer">
			<ul className="InfoLog">
				{props.messages.map((item, index) => (
					<li
						key={index}
						style={{
							color: item.type,
							fontSize: '13px',
							marginBottom: '10px',
						}}
					>
						{item.value}
					</li>
				))}
			</ul>
		</div>
	)
}
