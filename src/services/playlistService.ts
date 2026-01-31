import Playlist from '../models/Playlist';

export const createPlaylist = async (userId: string, data: any) => {
    const playlist = new Playlist({
        ...data,
        owner: userId
    });
    return await playlist.save();
};

export const getMyPlaylists = async (userId: string) => {
    return await Playlist.find({ owner: userId }).sort({ createdAt: -1 });
};

export const getPlaylistById = async (id: string) => {
    return await Playlist.findById(id)
        .populate({
            path: 'songs',
            populate: {
                path: 'artists',
                select: 'artistName'
            }
        })
        .populate('owner', 'username fullName');
};

export const updatePlaylist = async (userId: string, id: string, data: any) => {
    const playlist = await Playlist.findById(id);
    if (!playlist) throw new Error('Playlist not found');
    if (playlist.owner.toString() !== userId.toString()) throw new Error('Unauthorized');

    Object.assign(playlist, data);
    return await playlist.save();
};

export const deletePlaylist = async (userId: string, id: string) => {
    const playlist = await Playlist.findById(id);
    if (!playlist) throw new Error('Playlist not found');
    if (playlist.owner.toString() !== userId.toString()) throw new Error('Unauthorized');

    return await Playlist.deleteOne({ _id: id });
};

export const addSongToPlaylist = async (userId: string, playlistId: string, songId: string) => {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new Error('Playlist not found');
    if (playlist.owner.toString() !== userId.toString()) throw new Error('Unauthorized');

    if (!playlist.songs.map(id => id.toString()).includes(songId)) {
        playlist.songs.push(songId as any);
    }
    return await playlist.save();
};

export const removeSongFromPlaylist = async (userId: string, playlistId: string, songId: string) => {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new Error('Playlist not found');
    if (playlist.owner.toString() !== userId.toString()) throw new Error('Unauthorized');

    playlist.songs = playlist.songs.filter(sId => sId.toString() !== songId.toString());
    return await playlist.save();
};
