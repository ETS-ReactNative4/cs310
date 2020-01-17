import React, {Component} from 'react';
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
    TextInput,
    Button,
    Alert,
    TouchableHighlight,
    TouchableOpacity,
    Touchable,
    NativeModules,
    Platform,
    Image,
    FlatList
    } from 'react-native';
import ProgressBar from "./ProgressBar.js";
import Track from "./Track.js";
window.navigator.userAgent = 'react-native';
import {createStackNavigator, createAppContainer} from "react-navigation";
import DeviceInfo from "react-native-device-info";
import qs from "query-string";

var spotifySDKBridge = NativeModules.SpotifySDKBridge;




function getArtistString(artists) {
    var newArr = artists.map(function(val, index) {
        return val.name;
    });

    return newArr.join(", ");
}

export default class HostLobby extends Component {

    ws = new WebSocket("https://5b5gjj48d4.execute-api.us-west-2.amazonaws.com/epsilon-2");

    constructor(props) {
        super(props);
        this.state = {
            recommendations: [],
            lobby: {},
            selected: {},
            activeSong: {
                isSet: false,
                name: "<SongName>",
                uri: "",
                artists: "<Artists>",
                length: 100000
            },
            voteEnabled: false,
            votes: {}
        }
    }

    getRecommendations(access_token) {

        const url = "https://u4lvqq9ii0.execute-api.us-west-2.amazonaws.com/epsilon-1/get_recommendations";

        fetch(url, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: qs.stringify({
                "uid": DeviceInfo.getUniqueId(),
                "access_token": access_token
            })
        })
        .then((response) => response.json())
        .then((responseJson) => {
            this.setState({
                recommendations: responseJson,
                voteEnabled: true
            });
        })
        .catch((error) => {
            Alert.alert("ERROR: " + error);
        });
    }

    endVoting() {

        /* Disable the voting for this song */
        this.setState({voteEnabled: false});

        /* Fetch final vote numbers from lambda */

        const url = "https://u4lvqq9ii0.execute-api.us-west-2.amazonaws.com/epsilon-1/get_next_song";

        fetch(url, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: qs.stringify({
                uid: DeviceInfo.getUniqueId()
            })
        })
        .then((response) => response.json())
        .then((responseJson) => {
            // Handle final vote response
            // Alert.alert(responseJson);

            var max = -1;
            var nextSong = "";

            responseJson.forEach((item) => {
                if (item.vote_no.N > max) {
                    max = item.vote_no.N;
                    nextSong = item.track_id.S;
                }
            });


            /* Get track info from spotify */


        })
        .catch((error) => {
            Alert.alert("ERROR " + error);
        });

    }

    componentDidMount = () => {

        this.ws.onopen = () => {
            this.setState({voteEnabled: true});
        };

        this.ws.onmessage = (evt) => {
            // Received a message from lambda, probably a vote message
            var votes = JSON.parse(evt.data);
            // this.state.recommendations.forEach((item) => {})
            newVotes = this.state.votes;
            votes.forEach((item) => {
                newVotes[item.track_id.S] = item.vote_no.N;
            });

            this.setState({votes: newVotes});
        };

        this.ws.onclose = () => {
            Alert.alert("Disconnected from Websocket API.");
            clearTimeout(this.timer);
        }

        spotifySDKBridge.getAccessToken((error, result) => {
            if (error) {
                Alert.alert(error);
            } else {
                this.getRecommendations(result);
            }
        });
    }

    componentWillUnmount() {

        /* Called when react-navigation pops HostLobby component off of navigation stack */

        /* Send HTTP request to delete current lobby from DynamoDB */

        const url = "https://u4lvqq9ii0.execute-api.us-west-2.amazonaws.com/epsilon-1/delete_lobby";

        fetch(url, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: qs.stringify({
                uid: DeviceInfo.getUniqueId()
            })
        })
        .catch((error) => {
            Alert.alert("Error unmounting HostLobby component: " + error);
        });
    }

    render() {
        const {navigation} = this.props;
        const uid = DeviceInfo.getUniqueId();

        const lobbyInfo = {
            name: navigation.getParam("name","ERROR RETRIEVING LOBBY NAME"),
            key: navigation.getParam("key", "ERROR RETRIEVING LOBBY KEY"),
            playlist_id: navigation.getParam("playlist_id","ERROR RETRIEVING PLAYLIST ID"),
            chat: (navigation.getParam("chat","ERROR RETRIEVING CHAT STATUS") == "true"),
            lyrics: (navigation.getParam("lyrics","ERROR RETRIEVING LYRICS STATUS") == "true"),
            volume: (navigation.getParam("volume","ERROR RETRIEVING VOLUME STATUS") == "true")
        }

        return (
            <View style={styles.HostLobbyBody}>

                <View style= {styles.HostLobbyHeader}>
                    <View style = {styles.lobbyNameView}>
                        <Text style = {styles.lobbyName}>{lobbyInfo.name}</Text>
                    </View>
                    <View style = {styles.lobbyKeyView}>
                    <Text style = {styles.lobbyKey}>Join with: {lobbyInfo.key}</Text>
                    </View>
                </View>

                <View style = {styles.TrackImageView}>
                    {this.state.activeSong.isSet && <Image
                        style = {styles.playlistImage}
                        source = {{uri: this.state.activeSong.uri}}
                    />}
                </View>

                <View style = {styles.SongInfo}>
                    <Text>{this.state.activeSong.name} - {this.state.activeSong.artists}</Text>
                    <ProgressBar
                        enabled = {this.state.activeSong.isSet}
                        time = {this.state.activeSong.length}
                        factor = {500}
                        length = {300}
                        height = {10}
                        barColor = {"#ffffff"}
                        progressColor = {"#cc5555"}
                    >
                    </ProgressBar>
                </View>

                <View style = {styles.Recommendations}>
                    {this.state.voteEnabled && <FlatList
                        data = {this.state.recommendations}
                        extraData = {this.state}
                        renderItem = {({item}) => (
                            <TouchableOpacity
                                onPress = {() => {

                                    if (!this.state.activeSong.isSet) {
                                        Alert.alert(item.duration_ms);
                                        this.play(item.id, item.name, item.album.images[0].url, getArtistString(item.artists), item.duration_ms)
                                    } else {
                                        this.ws.send(JSON.stringify({
                                            action: "vote",
                                            uid: DeviceInfo.getUniqueId(),
                                            track_id: item.id
                                        }));
                                    }
                                }}
                                style = {[
                                    styles.recommendation
                                ]}
                            >
                                <Track
                                    trackid = {item.id}
                                    name = {item.name}
                                    imageurl = {item.album.images[0].url}
                                    artists = {item.artists}
                                    votes = {this.state.votes[item.id]}
                                />

                            </TouchableOpacity>



                        )}
                        keyExtractor = {item => item.id}

                    />}
                </View>

            </View>
        );
    }
};

const styles = StyleSheet.create({
    HostLobbyBody: {
        flex: 1,
        backgroundColor: "#ffffff",
        justifyContent: "space-around"
    },

    HostLobbyHeader: {
        flexDirection: "row",
        flex: 1,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "space-around"
    },

    lobbyNameView: {
        backgroundColor: "#2299dd",
        borderRadius: 10,
        padding: 10,
        margin: 10
    },

    lobbyKeyView: {
        backgroundColor: "#2299dd",
        borderRadius: 10,
        padding: 10,
        margin: 10
    },

    lobbyName: {
        color: "#151515",
        fontSize: 20
    },

    lobbyKey: {
        color: "#151515",
        fontSize: 20
    },

    TrackImageView: {
        flex: 3,
        backgroundColor: "#666666",
        justifyContent: "center",
        alignItems: "center"
    },

    SongInfo: {
        flex: 1,
        backgroundColor: "#999999",
        justifyContent: "center",
        alignItems: "center"
    },

    Recommendations: {
        flex: 3,
        backgroundColor: "#cccccc"
    },

    playlistImage: {
        width: 200,
        height: 200
    }
});