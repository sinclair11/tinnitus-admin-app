import React from 'react';
import { Icons } from '@src/utils/icons';
import { modalStyle } from '@src/styles/styles';
import Modal from 'react-modal';
import { UploadForm } from '@components/modal-upload/modal-upload';
import { ProgressbarUpload } from '@src/components/progressbar/progressbar-upload';
import axios from 'axios';

type UploadModalProps = {
    modalIsOpen?: boolean;
    setModalIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    action: string;
    type: string;
    editable?: { name: string; tags: string; description: string };
};

export const UploadVideoModal: React.FC<UploadModalProps> = (
    props: UploadModalProps,
) => {
    //Cancel token for abort operation
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    function closeModal(): void {
        props.setModalIsOpen(false);
    }

    return (
        <div>
            <Modal
                isOpen={props.modalIsOpen}
                style={modalStyle()}
                contentLabel="Upload"
                ariaHideApp={false}
            >
                <div className="UploadFormContainer">
                    <UploadForm
                        formModal={props.setModalIsOpen}
                        type={props.type}
                        action={props.action}
                        data={props.editable}
                        cancelation={source}
                    />
                </div>

                <p className="ModalTitle">
                    {props.action === 'upload' ? 'Upload' : 'Edit'}
                </p>
                <img
                    src={Icons['CancelIcon']}
                    className="CancelIcon"
                    onClick={closeModal}
                />
            </Modal>
            <ProgressbarUpload cancelation={source} />
        </div>
    );
};
