import React, { useState } from 'react';
import { Icons } from '@src/utils/icons';
import { modalStyles } from '../../utils/styles'
import Modal from 'react-modal';
import './upload.css';
import { UploadForm } from '../ModalUpload/ModalUpload'
import { ProgressbarUpload } from '@src/components/Progressbar/ProgressbarUpload'

type UploadModalProps = {
  modalIsOpen: boolean,
  setModalIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setDone?: React.Dispatch<React.SetStateAction<boolean>>,
}

export const UploadVideoModal: React.FC<UploadModalProps> = (props: UploadModalProps) => {

  const [progressOpen, setProgressOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [messages, setMessages] = useState([]);
  const [variant, setVariant] = useState('success');

  function closeModal() {
    props.setModalIsOpen(false)
  }

  return (
    <div>
      <Modal
        isOpen={props.modalIsOpen}
        style={modalStyles}
        contentLabel="Upload"
      >
        <div className="UploadFormContainer">
          <UploadForm
            formModal={props.setModalIsOpen}
            progressModal={setProgressOpen}
            updateProgress={setProgress}
            updateConsoleLog={setMessages}
            setVariant={setVariant}
          />
        </div>

        <p className="ModalTitle">Upload</p>
        <img src={Icons['CancelIcon']} className="CancelIcon" onClick={() => closeModal()} />
      </Modal>
      <ProgressbarUpload
        isOpen={progressOpen}
        setOpen={setProgressOpen}
        progress={progress}
        messages={messages}
        updateConsoleLog={setMessages}
        updateProgress={setProgress}
        variant={variant}
        updateVariant={setVariant}
      />
    </div>
  )
}
