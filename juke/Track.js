import React, {Component} from "react";
import {
    View,
    Text,
    Alert,
    Touchable,
    StyleSheet,
    Image
} from "react-native";

export default class Track extends Component {

    constructor(props) {
        super(props);
        this.state = {votes: this.props.votes};
    };

    componentDidMount() {
        // this.updateItem();
    };

    componentDidUpdate(prevProps) {

    }

    updateItem() {
        this.setState({
            id: this.props.trackid,
            name: this.props.name,
            image_url: this.props.imageurl,
            votes: this.props.votes
        });
    }


    getArtistString(artists) {
        var newArr = artists.map(function(val, index) {
            return val.name;
        });

        return newArr.join(", ");
    }

    /* PROPS:
    ** width
    ** height
    ** track_id
    ** track_name
    ** image_url
    ** artists
    ** length
    **
    **
    */



    render() {

        return (
            <View style = {(this.props.isSelected) ? styles.trackContainerSelected : styles.trackContainerUnselected}>

                <View style = {styles.imageBox}>
                    <View style = {styles.imageView}>
                        <Image
                            style = {{
                                width: 50,
                                height: 50,
                                padding: 10
                            }}
                            source = {{uri: this.props.imageurl}}
                        />
                    </View>
                </View>

                <View style = {styles.infoBox}>
                    <Text numberOfLines={1} style={styles.trackName}>{this.props.name}</Text>
                    <Text numberOfLines={1} style={styles.trackArtists}>{(this.props.isArtistString) ? this.props.artists : this.getArtistString(this.props.artists)}</Text>
                </View>

                <View style = {styles.voteBox}>
                    <View style = {styles.voteView}>
                        <Text style = {styles.voteText}>{this.props.votes}</Text>
                    </View>
                </View>

            </View>
        )

    };
};

const styles = StyleSheet.create({

    trackContainerUnselected: {
        flexDirection: "row",
        flex: 1,
        alignSelf: "stretch",
        alignItems: "stretch",
        backgroundColor: "#666666"
    },
    trackContainerSelected: {
        flexDirection: "row",
        flex: 1,
        alignSelf: "stretch",
        alignItems: "stretch",
        backgroundColor: "#999999"
    },

    imageBox: {
        flex: 1,
        alignContent: "center"
    },

    imageView: {
        padding: 5,
        alignItems: "center"
    },

    infoBox: {
        flex: 4,
        paddingTop: 5
    },

    trackName: {
        color: "#ffffff"
    },
    trackArtists: {
        fontSize: 12
    },

    voteBox: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },

    voteView: {
        width: 50,
        height: 50,
        padding: 5,
        justifyContent: "center",
        borderRadius: 10
    },

    voteText: {
        alignSelf: "center",
        color: "#ffffff",
        fontWeight: "bold"
    }
});
