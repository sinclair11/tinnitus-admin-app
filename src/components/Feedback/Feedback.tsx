import React, { useState } from 'react';
import './feedback.css'
import { ToolbarIcons } from '../../utils/icons'
import ReactTooltip from 'react-tooltip';
import Modal from 'react-modal';
import { Button } from 'react-bootstrap'

export const Feedback: React.FC = () => {

    return (
        <div className="FbContainer">
            <FeedbackComment />
        </div>
    )
}

export const FeedbackComment: React.FC = () => {

    const [modalIsOpen, setIsOpen] = React.useState(false);

    const customStyles = {
        content: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgb(4, 118, 163)',
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            borderRadius: '10px',
            border: '1px solid aqua',
        },
    };

    function closeModal() {
        setIsOpen(false);
    }

    return (
        <div className="Fback">
            <ReactTooltip place="top" type="dark" effect="float" delayShow={500} />
            <div className="FbackHeader">
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <p className="FbackMail">useremail@gmail.com </p>
                    <p className="FbackDate">3 Aug 2021 </p>
                </div>
                <img
                    src={ToolbarIcons['DeleteIcon']}
                    className="DeleteFback"
                    data-tip='Sterge comentariu'
                    onClick={() => setIsOpen(true)}
                />
                <Modal
                    isOpen={modalIsOpen}
                    style={customStyles}
                    contentLabel="Example Modal"
                >
                    <div>
                        <div>
                            <p style={{ color: 'white', fontWeight: 300, fontSize: 18 }}> Esti sigur ca vrei sa stergi acest obiect ?</p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10%' }}>
                            <Button
                                onClick={closeModal}
                                className="ModalBtn"
                            >
                                OK</Button>
                            <Button
                                onClick={closeModal}
                                className="ModalBtn"
                            >
                                Cancel</Button>
                        </div>
                    </div>

                </Modal>

            </div>
            <div className="FbackTextDiv">
                <p className="FbackText">
                    Feedback review
                </p>
            </div>
        </div>
    )
}