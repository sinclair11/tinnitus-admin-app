import { Icons } from '@src/utils/icons';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';

type ArtworkProps = {
    type: string;
    img?: any;
};

const Artwork = forwardRef((props: ArtworkProps, ref: any) => {
    const inputImg = useRef(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailInvalid, setThumbnailInvalid] = useState('');
    const thumbnailFile = useRef(null);

    useImperativeHandle(ref, () => ({
        getInputValidation: (): boolean => {
            if (thumbnail === null) {
                setThumbnailInvalid('Album cover art is mandatory');
                return false;
            } else {
                setThumbnailInvalid('');
                return true;
            }
        },

        getData: (): File => {
            return thumbnailFile.current;
        },

        clearInternalStates: (): void => {
            thumbnailFile.current = null;
            setThumbnail(null);
        },
    }));

    function onPlusClick(): void {
        //Trigger choose file dialog
        inputImg.current.click();
    }

    async function getImage(event: any): Promise<void> {
        const reader = new FileReader();
        const file = event.target.files[0];
        let res = null;

        if (event.target.files && file) {
            //Read image data
            reader.readAsDataURL(file);
            reader.onloadend = (): void => {
                res = reader.result;
                thumbnailFile.current = file;
                setThumbnail(res);
                setThumbnailInvalid('');
            };
        }
    }

    function displayThumbnail(): JSX.Element {
        if (thumbnail) {
            return <img src={thumbnail} />;
        } else {
            return <p>Please select a cover art for album</p>;
        }
    }

    function display(): JSX.Element {
        if (props.type === 'view' || props.type === 'edit') {
            return (
                <div className="upload-album-artwork">
                    <img src={props.img} />
                </div>
            );
        } else if (props.type === 'edit' || props.type === 'create') {
            return (
                <div className="upload-album-artwork-div">
                    <div className="upload-album-artwork">
                        <div className="plus-body" onClick={onPlusClick}>
                            <img src={Icons.Plus} className="plus" />
                            <input
                                ref={inputImg}
                                className="input-plus"
                                type="file"
                                accept="image/*"
                                onChange={(event): Promise<void> => getImage(event)}
                            />
                        </div>
                        {displayThumbnail()}
                    </div>
                    <p className="invalid-input invalid-thumbnail">{thumbnailInvalid}</p>
                </div>
            );
        }
    }

    return display();
});

export default Artwork;
