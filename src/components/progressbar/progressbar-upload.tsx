import React, { useEffect, useRef } from 'react';
import './progressbar.css';
import Modal from 'react-modal';
import { progressStyles } from '@src/styles/styles';
import { ProgressBar, Button } from 'react-bootstrap';
import { Icons } from '@utils/icons';
import { InfoLog } from '@src/components/infolog/infolog';
import { useSelector, useDispatch } from 'react-redux';
import { CombinedStates } from '@store/reducers/custom';

export const ProgressbarUpload: React.FC = () => {
    const btnDisabled = useRef('0.5');
    const btnEnabled = useRef('1');
    const dispatch = useDispatch();
    const btnContinue = useRef(null);
    const btnAbort = useRef(null);
    const isOpen = useSelector<CombinedStates>((state) => state.progressReducer.open) as boolean;
    const progress = useSelector<CombinedStates>((state) => state.progressReducer.progress) as number;
    const variant = useSelector<CombinedStates>((state) => state.progressReducer.variant) as string;
    const log = useSelector<CombinedStates>((state) => state.progressReducer.log) as Array<{
        type: string;
        value: unknown;
    }>;

    useEffect(() => {
        if (btnContinue.current != null && btnAbort.current != null) {
            btnContinue.current.style.opacity = btnDisabled.current;
            btnAbort.current.style.opacity = btnEnabled.current;
        }
    }, [btnContinue.current, btnAbort.current]);

    useEffect(() => {
        if (progress === 100) {
            if (btnContinue.current != null && btnAbort.current != null) {
                btnContinue.current.style.opacity = btnEnabled.current;
                btnAbort.current.style.opacity = btnDisabled.current;
            }
        }
    }, [progress]);

    function close(): void {
        dispatch({ type: 'progress/clean', payload: null });
        dispatch({ type: 'progress/abort', payload: true });
    }

    function onContinue(): void {
        if (btnContinue.current.style.opacity === btnEnabled.current) {
            btnContinue.current.style.opacity = btnDisabled.current;
            btnAbort.current.style.opacity = btnEnabled.current;
            dispatch({ type: 'progress/clean', payload: null });
        }
    }

    function onAbort(): void {
        if (btnAbort.current.style.opacity === btnEnabled.current) {
            btnContinue.current.style.opacity = btnEnabled.current;
            btnAbort.current.style.opacity = btnDisabled.current;
            dispatch({ type: 'progress/abort', payload: true });
            dispatch({ type: 'progress/fail', payload: { type: 'red', value: 'Upload aborted' } });
        }
    }

    return (
        <Modal isOpen={isOpen} style={progressStyles} contentLabel="Progressbar" ariaHideApp={false}>
            <div className="progress-container">
                <ProgressBar variant={variant} className="progressbar" animated now={progress} label={`${progress}%`} />
            </div>
            <InfoLog messages={log} />
            <p className="modal-title">Upload</p>
            <img src={Icons['CancelIcon']} className="cancel-icon" onClick={(): void => close()} />
            <Button ref={btnAbort} className="btn-progress-abort" onClick={onAbort}>
                <p className="btn-progress-txt">Abort</p>
            </Button>
            <Button ref={btnContinue} className="btn-progress-continue" onClick={onContinue}>
                <p className="btn-progress-txt">Continue</p>
            </Button>
        </Modal>
    );
};
