import React from 'react';
import './graph.css';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ToolbarIcons } from '../../utils/icons'
import ReactTooltip from 'react-tooltip';

type GraphProps = {
  container?: string,
  data?: Array<{ key: string, value: number }>
}

const data: Array<{ data: string, vizualizari: number }> = [
  {
    data: '1 Aug',
    vizualizari: 100,
  },
  {
    data: '2 Aug',
    vizualizari: 900,
  },
  {
    data: '3 Aug',
    vizualizari: 400,
  },
  {
    data: '4 Aug',
    vizualizari: 2780,
  },
  {
    data: '5 Aug',
    vizualizari: 1890,
  },
  {
    data: '6 Aug',
    vizualizari: 2390,
  },
  {
    data: '7 Aug',
    vizualizari: 5000,
  },
];


// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const Graph: React.FC<GraphProps> = (props: GraphProps) => {

  const dataa: Array<{ date: string, views: number }> = []

  return (
    <div className={props.container}>
      <ReactTooltip place="top" type="dark" effect="float" delayShow={500} />
      {/* Toolbar area */}
      <div className="GraphActions">
        <img data-tip="Alege data" src={ToolbarIcons['CalendarIcon']} className="GraphIcon" />
        <img data-tip="Alege tipul de grafic" src={ToolbarIcons['ChartIcon']} className="GraphIcon" />
        <img data-tip="Mareste" src={ToolbarIcons['ZoominIcon']} className="GraphIcon" />
        <img data-tip="Micsoreaza" src={ToolbarIcons['ZoomoutIcon']} className="GraphIcon" />
      </div>

      {/* Chart area */}
      <ResponsiveContainer width="100%" height="60%" className={props.container}>
        <AreaChart
          // width={300}
          // height={500}
          data={data}
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
          <Area type="monotone" dataKey="data" stroke="black" fill="aquamarine" />
          <Area type="monotone" dataKey="vizualizari" stroke="black" fill="aquamarine" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}