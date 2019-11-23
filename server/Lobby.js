class Lobby {

    constructor(key, uid) {
        this.key = key;
        this.user_list = [];
        this.votes = {};
        this.addUser(uid);
    }

    set_settings(name, playlist_uri, chat, lyrics, volume) {
        this.name = name;
        this.playlist_uri = playlist_uri;
        this.chat = chat;
        this.lyrics = lyrics;
        this.volume = volume;
    }

    vote(song, user) {
        if (this.votes[song]) {
            this.votes[song] = this.votes.song + user.getVote();
        } else {
            this.votes[song] = user.getVote();
        }
    }

    getNextSong() {
        var max = 0;
        var maxSong = "";
        for (var song in this.votes) {
            // skip loop if the property is from prototype
            if (!this.votes.hasOwnProperty(song)) continue;

            var songVotes = this.votes[song];

            if (songVotes > max) {
                max = songVotes;
                maxSong = song;
            }
        }
        return maxSong;
    }

    add_user(uid) {
        this.user_list.push(uid);
    }

    get_users() {
        return this.user_list;
    }

    getName() {
        return this.name;
    }

    getKey() {
        return this.key;
    }

    isChatEnabled() {
        return this.chat;
    }

    isLyricsEnabled() {
        return this.lyrics;
    }

    isVolumeEnabled() {
        return this.volume;
    }
}

module.exports.Lobby = Lobby;
