import React, { useEffect, useState } from 'react';
import './progressbar.css';
import Modal from 'react-modal';
import { progressStyles } from '@src/utils/styles';
import { ProgressBar, Button } from 'react-bootstrap';
import { Icons } from '@src/utils/icons';
import { InfoLog } from '@src/components/InfoLog/InfoLog'
import { setAbort } from '@src/components/ModalUpload/ModalUpload'
// import 'bootstrap/dist/css/bootstrap.min.css';

type ProgressProps = {
  isOpen?: boolean,
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>,
  jobDone?: boolean,
  progress?: number,
  messages?: Array<{ type: string, value: unknown }>,
  updateConsoleLog?: React.Dispatch<React.SetStateAction<Array<{ type: string, value: unknown }>>>,
  updateProgress?: React.Dispatch<React.SetStateAction<number>>,
  variant?: string,
  updateVariant?: React.Dispatch<React.SetStateAction<string>>,
}

export const ProgressbarUpload: React.FC<ProgressProps> = (props: ProgressProps) => {

  const [continueOpac, setContinueOpac] = useState(0.5)
  const [abortOpac, setAbortOpac] = useState(1)

  useEffect(() => {
    if (props.progress === 100) {
      setAbortOpac(0.5)
      setContinueOpac(1)
    }
    else {
      setContinueOpac(0.5)
      setAbortOpac(1)
    }
  })

  function resetProgress() {
    props.updateProgress(0)
    props.updateConsoleLog([])
    props.updateVariant('success')
    props.setOpen(false);
  }

  function closeModal() {
    if (props.progress < 100) {
      abortJob();
    }
    resetProgress()
  }

  function continueModal() {
    if (props.progress === 100) {
      resetProgress()
    }
  }

  function abortJob() {
    if (props.progress < 100) {
      setAbort(true);
    }
  }

  return (
    <Modal
      isOpen={props.isOpen}
      style={progressStyles}
      contentLabel="Progressbar"
    >
      <div className="ProgressContainer">
        <ProgressBar
          variant={props.variant}
          className="ProgressBar"
          animated now={props.progress}
          label={`${props.progress}%`}
        />
      </div>
      <InfoLog messages={props.messages} />
      <p className="ModalTitle">Upload</p>
      <img src={Icons['CancelIcon']} className="CancelIcon" onClick={() => closeModal()} />
      <Button
        className="BtnProgress"
        style={{ opacity: abortOpac }}
        onClick={abortJob}
      >
        <p className="BtnProgressTxt">Abort</p>
      </Button>
      <Button
        className="BtnProgress"
        style={{ right: "95px", opacity: continueOpac }}
        onClick={continueModal}
      >
        <p className="BtnProgressTxt">Continue</p>
      </Button>
    </Modal>
  )
}
