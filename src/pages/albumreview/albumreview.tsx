import React from 'react';
import { useParams } from 'react-router-dom';
import ReviewView from '@components/reviews/reviews';

const AlbumReviews: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="page" id="page-upload-edit">
            <div className="album-review">
                <ReviewView id={id} />
            </div>
        </div>
    );
};

export default AlbumReviews;
