export type SongData = {
    file?: any;
    extension?: string;
    name: string;
    pos: string | number;
    length: string;
    category: string;
    likes?: number;
    favorites?: number;
    views?: number;
};

export type AlbumFormData = {
    name: string;
    description: string;
    tags: string[];
    length: string;
    category: string;
    notification?: string;
};
