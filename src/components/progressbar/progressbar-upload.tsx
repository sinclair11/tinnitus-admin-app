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
    const dispatch = useDispatch();
    const btnContinue = useRef(null);
    const btnAbort = useRef(null);
    const isOpen = useSelector<CombinedStates>(
        (state) => state.progressReducer.open,
    ) as boolean;
    const progress = useSelector<CombinedStates>(
        (state) => state.progressReducer.progress,
    ) as number;
    const variant = useSelector<CombinedStates>(
        (state) => state.progressReducer.variant,
    ) as string;
    const log = useSelector<CombinedStates>(
        (state) => state.progressReducer.log,
    ) as Array<{ type: string; value: unknown }>;

    useEffect(() => {
        if (btnContinue.current != null) {
            btnContinue.current.disabled = true;
        }
    }, [btnContinue.current]);

    function close(): void {
        dispatch({ type: 'progress/clean', payload: null });
    }

    function onContinue(): void {
        if (btnContinue.current.disabled === false) {
            dispatch({ type: 'progress/clean', payload: null });
        }
    }

    function onAbort(): void {
        if (btnAbort.current.disabled == false) {
            dispatch({ type: 'progress/progress', payload: 100 });
            dispatch({ type: 'progress/variant', payload: 'danger' });
            dispatch({
                type: 'progress/log',
                payload: {
                    type: 'red',
                    value: 'Upload aborted',
                },
            });
            btnAbort.current.disabled = true;
            btnContinue.current.disabled = false;
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            style={progressStyles}
            contentLabel="Progressbar"
            ariaHideApp={false}
        >
            <div className="progress-container">
                <ProgressBar
                    variant={variant}
                    className="progressbar"
                    animated
                    now={progress}
                    label={`${progress}%`}
                />
            </div>
            <InfoLog messages={log} />
            <p className="modal-title">Upload</p>
            <img
                src={Icons['CancelIcon']}
                className="cancel-icon"
                onClick={(): void => close()}
            />
            <Button
                ref={btnAbort}
                className="btn-progress-abort"
                onClick={onAbort}
            >
                <p className="btn-progress-txt">Abort</p>
            </Button>
            <Button
                ref={btnContinue}
                className="btn-progress-continue"
                onClick={onContinue}
            >
                <p className="btn-progress-txt">Continue</p>
            </Button>
        </Modal>
    );
};
