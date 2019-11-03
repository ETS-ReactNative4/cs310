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
    Touchable,
    NativeModules,
    Platform,
    Linking,
    Modal,
    FlatList,
    Image,
    Dimensions,
    Picker
    } from 'react-native';
window.navigator.userAgent = 'react-native';
import io from 'socket.io-client/dist/socket.io';
import Carousel from "react-native-snap-carousel";
import DeviceInfo from "react-native-device-info";





export default class CreateLobby extends Component {

    constructor(props) {
        super(props);
        this.state = {
            lobbyName: "",
            modalVisible: true,
            isConnectedToSpotify: false,
            playlistModal: false,
            playlists: [],
            isSocketConnected: false,

            recommendationSystem: "In-order",
            lobbyType: "Gym"
        };
    }

    setModableVisible(visible) {
        this.setState({modalVisible: visible});
    }

    togglePlaylistModal(data) {
        this.setState({playlistModal: !this.state.playlistModal});
        this.setState({playlists: data});
    }

    carouselRenderItem({item, index}) {
        return (
            <View style={styles.playlistCard}>
                <Image
                    style = {{width: 175, height: 150}}
                    source = {{
                        uri: "http://harrys-macbook-pro.local:3000/get-image",
                        method: "POST",
                        headers: {
                            Pragma: "no-cache"
                        },
                        body: "spotify_url=" + item.images[0].url
                    }}
                />
                <View style = {(index % 2 == 0) ? styles.playlistCardInfoEven : styles.playlistCardInfoOdd}>
                    <Text style = {(index % 2 == 0) ? styles.playlistCardTitleEven : styles.playlistCardTitleOdd}>{item.name}</Text>
                    <Text style = {(index % 2 == 0) ? styles.playlistCardSongNumberEven : styles.playlistCardSongNumberOdd}>{item.tracks.total} Songs</Text>
                </View>
            </View>
        );
    }

    render() {
        const {navigate} = this.props.navigation;
        spotifySDKBridge = NativeModules.SpotifySDKBridge;

        return (
            <View style = {styles.createLobbyBody}>
                <View style = {styles.lobbyName}>
                    <TextInput
                        style = {styles.lobbyNameInput}
                        onChangeText = {(text) => {this.setState({lobbyName: text})}}
                        value = {this.state.lobbyName}
                        placeholder = "Lobby Name"
                        editable = {this.state.playlistModal}
                        maxLength = {40}
                        >
                    </TextInput>
                </View>

                <View style = {styles.spotifyFrame}>
                    <View style = {styles.spotifyFrameChild}>
                        {!this.state.isConnectedToSpotify && <TouchableHighlight
                            onPress = {() => {
                                spotifySDKBridge.instantiateBridge((error, result) => {
                                    if (error) {
                                        Alert.alert("Error instantiating bridge: " + error);
                                    } else if (result == 1) {
                                        spotifySDKBridge.auth((error, result) => {
                                            if (error) {
                                                Alert.alert("Error authenticating: " + error);
                                            } else if (result == 1) {
                                                this.setState({isConnectedToSpotify: true});
                                            } else if (result == 0) {
                                                Alert.alert("Result = 0 @ auth");
                                            }
                                        });
                                    } else if (result == 0) {
                                        Alert.alert("Result = 0 @ instantiateBridge");
                                    }
                                });


                            }}
                        >
                            <View style = {styles.spotifyConnectButton}>
                                <Text style = {styles.spotifyButtonText}>Connect to Spotify</Text>
                            </View>
                        </TouchableHighlight>}


                        {this.state.isConnectedToSpotify  && !this.state.playlistModal && <TouchableHighlight
                            onPress = {() => {
                                spotifySDKBridge.getPlaylists((error, results) => {
                                    if (error) {
                                        Alert.alert(error);
                                    } else {
                                        socket.emit("getPlaylists", DeviceInfo.getUniqueId());
                                        socket.on("gotPlaylists", (data) => {
                                            this.togglePlaylistModal(data);
                                            Alert.alert(data);
                                        });

                                    }
                                });
                            }}

                        >
                            <View style = {styles.getPlaylistsButton}>
                                <Text>Choose Playlist</Text>
                            </View>
                        </TouchableHighlight>}


                        {this.state.playlistModal && <View
                            style = {styles.setPlaylistCarousel}
                        >


                            <Carousel
                                ref = {(c) => { this._carousel = c; }}
                                data = {this.state.playlists}
                                renderItem = {this.carouselRenderItem}
                                sliderWidth = {Dimensions.get("window").width}
                                itemWidth = {175}

                                activeSlideAlignment = "center"
                                inactiveSlideScale = {0.8}
                                inactiveSlideOpacity = {0.6}
                                slideStyle = {styles.slideStyle}
                            />

                        </View>}
                    </View>
                </View>

                <View style = {styles.lobbySettings}>
                    <Picker
                        selectedValue = {this.state.recommendationSystem}
                        style = {styles.recommendationPicker}
                        onValueChange = {(itemValue, itemIndex) => {
                            this.setState({recommendationSystem: itemValue});
                        }}>
                        <Picker.Item label="In-order" value="In-order"/>
                        <Picker.Item label="Shuffle" value="Shuffle"/>
                        <Picker.Item label="Neural Network" value="Neural"/>
                    </Picker>
                    <Picker
                        selectedValue = {this.state.lobbyType}
                        style = {styles.lobbyTypePicker}
                        onValueChange = {(itemValue, itemIndex) => {
                            this.setState({lobbyType: itemValue});
                        }}>
                        <Picker.Item label="Gym" value="Gym"/>
                        <Picker.Item label="Party" value="Party"/>
                        <Picker.Item label="Bar" value="Bar"/>
                        <Picker.Item label="Car" value="Car"/>
                        <Picker.Item label="Other" value="Other"/>
                    </Picker>
                </View>

                <View style = {styles.createLobby}>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    createLobbyBody: {
        flex: 1,
        backgroundColor: "#ffffff",
        justifyContent: "space-around"
    },

    lobbyName: {
        flex: 1,
        backgroundColor: "#333333",
        justifyContent: "center",
        alignItems: "center"
    },
    lobbyNameInput: {
        width: 300,
        height: 50,
        backgroundColor: "#8d8",

    },

    spotifyFrame: {
        flex: 3,
        backgroundColor: "#666666",
        justifyContent: "center",
        alignItems: "stretch"
    },
    spotifyFrameChild: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    spotifyConnectButton: {
        width: 100,
        height: 100,
        backgroundColor: "#29d",
        justifyContent: "center",
        alignItems: "center"
    },
    setPlaylistCarousel: {
        flex: 1,
        justifyContent: "center"
    },
    getPlaylistsButton: {
        width: 100,
        height: 100,
        backgroundColor: "#8bc6ef"
    },
    playlistCard: {
        backgroundColor: "#cccccc",
        width: 175,
        height: 200,
        shadowColor: "#000000",
        shadowOpacity: 0.8,
        shadowRadius: 5,
        borderRadius: 25
    },
    playlistCardInfoEven: {
        backgroundColor: "#ffffff",
        height: 50,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25
    },
    playlistCardInfoOdd: {
        backgroundColor: "#151515",
        height: 50,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25
    },
    playlistCardTitleEven: {
        color: "#151515",
        textAlign: "center"
    },
    playlistCardTitleOdd: {
        color: "#ffffff",
        textAlign: "center"
    },
    playlistCardSongNumberEven: {
        color: "#151515",
        textAlign: "center"
    },
    playlistCardSongNumberOdd: {
        color: "#ffffff",
        textAlign: "center"
    },
    cardContainer: {
        justifyContent: "center"
    },
    slideStyle: {
        justifyContent: "center"
    },

    lobbySettings: {
        flex: 2,
        backgroundColor: "#999999",
        flexWrap: "wrap"
    },
    lobbySettingsText: {
        flex: 1
    },
    recommendationPicker: {
        flex: 4
    },
    lobbyTypePicker: {
        flex: 4
    },

    createLobby: {
        flex: 1,
        backgroundColor: "#cccccc",
        justifyContent: "center",
        alignItems: "center"
    },


});
