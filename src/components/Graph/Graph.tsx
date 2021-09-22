import React from 'react'
import './graph.css'
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts'
import { ToolbarIcons } from '../../utils/icons'
import ReactTooltip from 'react-tooltip'

type GraphProps = {
	container?: string
	data?: Array<{ data: string; vizualizari: number }>
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const Graph: React.FC<GraphProps> = (props: GraphProps) => {
	function GraphOrPlaceholder(): JSX.Element {
		if (props.data === undefined) {
			return (
				<div
					style={{
						marginTop: '10px',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						width: '100%',
						height: '65%',
						border: '1px solid aquamarine',
					}}
				>
					<p>
						Functia de afisare a datelor nu este disponibila
						momentan.
					</p>
				</div>
			)
		} else {
			return (
				<ResponsiveContainer
					width="100%"
					height="60%"
					className={props.container}
				>
					<AreaChart
						// width={300}
						// height={500}
						data={props.data}
						margin={{
							top: 10,
							right: 0,
							left: -15,
							bottom: 0,
						}}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="data" stroke="aqua" />
						<YAxis dataKey="vizualizari" stroke="aqua" />
						<Tooltip />
						<Area
							isAnimationActive={false}
							type="monotone"
							dataKey="data"
							stroke="black"
							fill="aquamarine"
						/>
						<Area
							isAnimationActive={false}
							type="monotone"
							dataKey="vizualizari"
							stroke="black"
							fill="aquamarine"
						/>
					</AreaChart>
				</ResponsiveContainer>
			)
		}
	}

	return (
		<div className={props.container}>
			<ReactTooltip
				place="top"
				type="dark"
				effect="float"
				delayShow={500}
			/>
			{/* Toolbar area */}
			<div className="GraphActions">
				<img
					data-tip="Alege data"
					src={ToolbarIcons['CalendarIcon']}
					className="GraphIcon"
				/>
				<img
					data-tip="Alege tipul de grafic"
					src={ToolbarIcons['ChartIcon']}
					className="GraphIcon"
				/>
				<img
					data-tip="Mareste"
					src={ToolbarIcons['ZoominIcon']}
					className="GraphIcon"
				/>
				<img
					data-tip="Micsoreaza"
					src={ToolbarIcons['ZoomoutIcon']}
					className="GraphIcon"
				/>
			</div>
			{GraphOrPlaceholder()}
		</div>
	)
}
