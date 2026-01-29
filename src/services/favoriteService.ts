import Favorite from '../models/Favorite';

export const getFavorites = async (userId: string) => {
    let favorites = await Favorite.findOne({ user: userId })
        .populate('songs')
        .populate('albums')
        .populate('playlists')
        .populate('artists');

    if (!favorites) {
        favorites = await Favorite.create({ user: userId });
    }
    return favorites;
};

export const toggleFavoriteSong = async (userId: string, songId: string) => {
    let favorites = await Favorite.findOne({ user: userId });
    if (!favorites) {
        favorites = await Favorite.create({ user: userId });
    }

    const index = favorites.songs.indexOf(songId as any);
    if (index > -1) {
        favorites.songs.splice(index, 1);
    } else {
        favorites.songs.push(songId as any);
    }
    return await favorites.save();
};

export const toggleFavoriteAlbum = async (userId: string, albumId: string) => {
    let favorites = await Favorite.findOne({ user: userId });
    if (!favorites) {
        favorites = await Favorite.create({ user: userId });
    }

    const index = favorites.albums.indexOf(albumId as any);
    if (index > -1) {
        favorites.albums.splice(index, 1);
    } else {
        favorites.albums.push(albumId as any);
    }
    return await favorites.save();
};

export const toggleFavoritePlaylist = async (userId: string, playlistId: string) => {
    let favorites = await Favorite.findOne({ user: userId });
    if (!favorites) {
        favorites = await Favorite.create({ user: userId });
    }

    const index = favorites.playlists.indexOf(playlistId as any);
    if (index > -1) {
        favorites.playlists.splice(index, 1);
    } else {
        favorites.playlists.push(playlistId as any);
    }
    return await favorites.save();
};

export const followArtist = async (userId: string, artistId: string) => {
    let favorites = await Favorite.findOne({ user: userId });
    if (!favorites) {
        favorites = await Favorite.create({ user: userId });
    }

    const index = favorites.artists.indexOf(artistId as any);
    if (index > -1) {
        favorites.artists.splice(index, 1);
    } else {
        favorites.artists.push(artistId as any);
    }
    return await favorites.save();
};
