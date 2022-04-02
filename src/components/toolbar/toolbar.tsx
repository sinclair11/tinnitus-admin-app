import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ToolbarIcons } from '@utils/icons';
import ReactTooltip from 'react-tooltip';
import axios from 'axios';
import Modal from 'react-modal';
import { MessageBox } from '../messagebox/messagebox';
import { DialogBox } from '../dialogbox/dialogbox';
import { dialogStyles, hourglassStyle } from '@src/styles/styles';
import { useDispatch, useSelector } from 'react-redux';
import { CombinedStates } from '@src/store/reducers/custom';
import ErrorHandler from '@src/utils/errorhandler';

type ToolbarProps = {
    container?: string;
    type: string;
};

export const Toolbar: React.FC<ToolbarProps> = (props?: ToolbarProps) => {
    const history = useHistory();
    const [modalIsOpen, setIsOpen] = useState(false);
    const [action, setAction] = useState('');
    const [editData, setEditData] = useState({
        name: '',
        tags: '',
        description: '',
    });
    const [messageOpen, setMessageOpen] = useState(false);
    const [messageboxMsg, setMessageboxMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [dialogbox, setDialogbox] = useState(false);
    const [accept, setAccept] = useState(false);
    const dispatch = useDispatch();
    const selected = useSelector<CombinedStates>(
        (state) => state.resdataReducer.selected,
    ) as string;

    useEffect(() => {
        // if (accept == true) {
        //     requestResourceDeletion();
        //     //Reset action accept state
        //     setAccept(false);
        // }
    }, [accept]);

    // async function openModal(type: string): Promise<void> {
    //     if (type === 'edit') {
    //         //Check if there is a resource selected
    //         if (store.getState().resdataReducer.selected !== '') {
    //             try {
    //                 //Activate loading screen
    //                 setLoading(true);
    //                 //First get the phase
    //                 //Get info about resource from database
    //                 const response = await axios({
    //                     method: 'get',
    //                     url: `http://127.0.0.1:3000/api/admin/${
    //                         props.type
    //                     }/infodb/general?id=${
    //                         store.getState().resdataReducer.selected
    //                     }`,
    //                     headers: {
    //                         'Content-Type': 'application/json',
    //                         Authorization: `Bearer ${
    //                             store.getState().generalReducer.token
    //                         }`,
    //                     },
    //                 });
    //                 //Set received editable data
    //                 setEditData({
    //                     name: response.data.name,
    //                     tags: response.data.tags,
    //                     description: response.data.description,
    //                 });
    //                 //Close loading screen
    //                 setLoading(false);
    //                 //Open edit modal and pass editable data of this resource
    //                 setAction(type);
    //                 setIsOpen(true);
    //             } catch (error) {
    //                 //Close loading screen
    //                 setLoading(false);
    //                 //Info could not be retrieved from database
    //                 //Handle error and display message
    //                 const result = ErrorHandler.getErrorType(error);
    //                 //Notify user about occured error
    //                 setMessageboxMsg(result);
    //                 setMessageOpen(true);
    //             }
    //         } else {
    //             //Notify user that he must select a resource first
    //             setMessageboxMsg('Selectati un album intai!');
    //             setMessageOpen(true);
    //         }
    //     } else if (type === 'upload') {
    //         //Make sure editable data is clean
    //         setEditData({
    //             name: '',
    //             tags: '',
    //             description: '',
    //         });
    //         //Just open the upload modal
    //         setAction(type);
    //         setIsOpen(true);
    //     }
    // }

    /**
     *
     */
    // async function requestResourceDeletion(): Promise<void> {
    //     //Activate loading screen
    //     setLoading(true);
    //     try {
    //         const path = `http://127.0.0.1:3000/api/admin/${
    //             props.type
    //         }/del?id=${store.getState().resdataReducer.selected}`;
    //         console.log(path);
    //         //Request deletion of resource
    //         await axios({
    //             method: 'delete',
    //             url: path,
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 Authorization: `Bearer ${
    //                     store.getState().generalReducer.token
    //                 }`,
    //             },
    //         });
    //         //Reset selected resource state
    //         dispatch({ type: 'resdata/selected', payload: '' });
    //         //Close loading screen
    //         setLoading(false);
    //     } catch (error) {
    //         //Close loading screen
    //         setLoading(false);
    //         //Retrieve message for corresponding status code
    //         //Handle error and display message
    //         const result = ErrorHandler.getErrorType(error);
    //         //Set message and notify user about occured error
    //         setMessageboxMsg(result);
    //         setMessageOpen(true);
    //     }
    // }

    function onRequestDeleteClick(): void {
        //First check if a resource was selected
        // if (store.getState().resdataReducer.selected != '') {
        //     setDialogbox(true);
        // } else {
        //     //Notify user that he must select a resource first
        //     setMessageboxMsg('Selectati un album intai!');
        //     setMessageOpen(true);
        // }
    }

    return (
        <div className={props.container + ' ToolbarContainer '}>
            <ReactTooltip
                place="top"
                type="dark"
                effect="float"
                delayShow={500}
            />
            <div
                className="toolbar-action"
                onClick={(): void => history.push('/audio/upload')}
            >
                <img src={ToolbarIcons['UploadIcon']} className="ActionIcon" />
                <p>Incarca</p>
            </div>

            <div
                className="toolbar-action"
                // onClick={(): Promise<void> => openModal('edit')}
            >
                <img src={ToolbarIcons['EditIcon']} className="ActionIcon" />
                <p>Editeaza</p>
            </div>

            <div className="toolbar-action" onClick={onRequestDeleteClick}>
                <img
                    data-tip="Sterge"
                    src={ToolbarIcons['DeleteIcon']}
                    className="ActionIcon"
                />
                <p>Sterge</p>
            </div>
            <Modal
                isOpen={messageOpen}
                style={dialogStyles}
                contentLabel="Upload"
                ariaHideApp={false}
            >
                <MessageBox
                    setIsOpen={setMessageOpen}
                    message={messageboxMsg}
                />
            </Modal>
            <Modal
                isOpen={dialogbox}
                style={dialogStyles}
                contentLabel="Dialog box"
                ariaHideApp={false}
            >
                <DialogBox
                    setIsOpen={setDialogbox}
                    message="Esti sigur ca vrei sa stergi acest album?"
                    setAccepted={setAccept}
                />
            </Modal>
            <Modal isOpen={loading} style={hourglassStyle} ariaHideApp={false}>
                <div className="hourglass"></div>
            </Modal>
        </div>
    );
};
