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
    Platform
    } from 'react-native';
window.navigator.userAgent = 'react-native';
import io from 'socket.io-client/dist/socket.io';
import {createStackNavigator, createAppContainer} from "react-navigation";

const socket = io("http://harrys-macbook-pro.local:3000");
var spotifySDKBridge = NativeModules.SpotifySDKBridge;

export default class Landing extends Component {

    constructor(props) {
        super(props);
        this.state = {text: ""};
    }

    render() {
        const {navigate} = this.props.navigation;
        return (
            <View style={styles.body}>
                <Text style={styles.title}>Juke</Text>
                <View>
                    <TextInput
                        style = {styles.keyInput}
                        onChangeText = {(text) => this.setState({text})}
                        value = {this.state.text}
                        autoCorrect = {false}
                    />
                    <Button
                        style = {styles.joinLobbyButton}
                        onPress = {() => {
                            socket.emit("joinRoom", this.state.text);
                        }}
                        title = "Join Lobby"
                    />
                </View>
                <Button
                    style = {styles.createLobbyButton}
                    onPress = {() => {
                        spotifySDKBridge.instantiateBridge();
                        socket.emit("bp1");
                        spotifySDKBridge.configure();
                        socket.emit("bp2");
                        spotifySDKBridge.isSpotifyInstalled((error, result) => {
                            if (error) {
                                Alert.alert(error);
                            } else if (result == 0) {
                                Alert.alert("Spotify is not installed");
                            } else if (result == 1) {
                                Alert.alert("spotify is installed");
                            } else {
                                Alert.alert("Not sure if spotify is installed:");
                                Alert.alert("result = " + result);
                            }
                        });
                        socket.emit("setHash");
                        socket.on("getHash", (data) => {
                            navigate("CreateLobby", {
                                socket: socket,
                                spotifySDKBridge: spotifySDKBridge
                            });
                        });
                    }}
                    title = "Create Lobby"
                />

            </View>
        );
    }
};

const styles = StyleSheet.create({
    body: {
        flex: 1,
        textAlign: "center",
        justifyContent: "space-around",
        backgroundColor: "#151515",
        alignItems: "center"
    },
    title: {
        fontSize: 30,
        color: "#29d",
        textAlign: "center",
        margin: 50
    },
    keyInput: {
        width: 150,
        height: 50,
        textAlign: "center",
        backgroundColor: "#fff",
        margin: 20,
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#29d",
        backgroundColor: "#383838",
        borderRadius: 5,
        fontSize: 20,
        color: "#fff"

    }
});