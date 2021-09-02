import React from 'react';
import './toolbar.css'
import { ToolbarIcons } from '../../utils/icons'
import ReactTooltip from 'react-tooltip';
import { UploadVideoModal } from '../Upload/Upload'
import { Modal } from 'react-bootstrap';

type ToolbarProps = {
  container: string;
}


export const Toolbar: React.FC<ToolbarProps> = (props?: ToolbarProps) => {

  const [modalIsOpen, setIsOpen] = React.useState(false);

  return (
    <div className={props.container + ' Container'}>
      <ReactTooltip place="top" type="dark" effect="float" delayShow={500} />
      <img data-tip="Incarca" src={ToolbarIcons['UploadIcon']} className="ActionIcon" onClick={() => setIsOpen(true)} />
      <img data-tip="Editeaza" src={ToolbarIcons['EditIcon']} className="ActionIcon" />
      <img data-tip="Sterge" src={ToolbarIcons['DeleteIcon']} className="ActionIcon" />
      <UploadVideoModal modalIsOpen={modalIsOpen} setModalIsOpen={setIsOpen}/>
    </div>
  )
}
