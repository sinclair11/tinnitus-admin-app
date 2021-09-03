import React from 'react';
import './modalsearch.css'
import Modal from 'react-modal';
import {hourglassStyle} from '@src/utils/styles'

type ModalSearchProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}


export const ModalSearch: React.FC<ModalSearchProps> = (props: ModalSearchProps) => {
  return (
    <Modal
      isOpen={props.isOpen}
      style={hourglassStyle}
    >
      <div className="hourglass"></div>
    </Modal>
  )
}
