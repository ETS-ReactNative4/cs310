import React, {Component} from "react";
import {
    View,
    Alert,
    StyleSheet
} from "react-native";

export default class ProgressBar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            length: 0
        };
    };

    refreshBar() {
        const totalTime = this.props.time;
        const factor = this.props.factor;
        const initTime = this.props.time_invoked;
        const mountingTime = Date.now();

        clearTimeout(this.timer);

        this.timer = setInterval(() => {
            this.setState({
                length: ((Date.now() - initTime) / totalTime) * this.props.length
            });
        }, totalTime / factor);
    }

    componentDidMount() {
        this.refreshBar();
    };

    componentDidUpdate(prevProps) {
        if (prevProps.time != this.props.time) {
            this.setState({
                length: 0
            });
            this.refreshBar();
        }
    }

    render() {

        return (
            <View style = {
                [{width: this.props.length,
                height: this.props.height,
                backgroundColor: this.props.barColor},
                styles.bar]
            }>
                {this.props.enabled && <View style = {{
                    width: this.state.length,
                    height: this.props.height,
                    backgroundColor: this.props.progressColor
                }}>
                </View>}
            </View>
        )

    };
};

const styles = StyleSheet.create({
    bar: {
        borderColor: "#ffffff",
        borderWidth: 0,
        borderRadius: 10,
        overflow: "hidden"
    }
});
