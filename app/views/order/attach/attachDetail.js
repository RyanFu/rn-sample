'use strict';

var React = require('react-native');
var TimerMixin = require('react-timer-mixin');
import NavigationBar from '../../../common/react-native-navbar/index';
var Actions = require('react-native-router-flux').Actions;
var SearchBar = require('react-native-search-bar');
var moment = require('moment');
var {
    View,
    Text,
    Image,
    ListView,
    ScrollView,
    TouchableOpacity,
    TouchableHighlight,
    ActionSheetIOS,
    StyleSheet
} = React;


var commonStyle = require('../../../styles/commonStyle');
var styles = require('../../../styles/order/orderDetail');

var BlueBackButton = require('../../../common/blueBackButton');
var RightSettingButton = require('../../../common/rightSettingButton');
var AttachSetting = require('./attachSetting');

var attachAction = require('../../../actions/attach/attachAction');
var attachStore = require('../../../stores/attach/attachStore');

module.exports = React.createClass({
    mixins: [TimerMixin],
    getInitialState: function(){
        console.log('-------propsdata', this.props.data);
        return {
            gmtCreate: this.props.data.gmtCreate,
            absoluteUrl: this.props.data.absoluteUrl,
            fileName: this.props.data.fileName,
            userName: this.props.data.userName || '',
            accessoryId: this.props.data.id
        }
    },
    componentDidMount: function(){
        this.unlisten = attachStore.listen(this.onChange);
    },
    componentWillUnmount: function() {
        this.unlisten();
    },
    onChange: function(){
        var result = attachStore.getState();
        if (result.status != 200 && !!result.message) {
            return;
        }
        switch(result.type){
            case 'get':
                return this.doGet(result);
            case 'update':
                return this.doUpdate(result);
            default: return;
        }
    },
    doGet: function(result){
        this.setState({
            gmtCreate: result.data.gmtCreate,
            absoluteUrl: result.data.absoluteUrl,
            fileName: result.data.fileName,
            userName: result.data.userName,
            accessoryId: result.data.id
        });
    },
    doUpdate: function(result){
        if (this._timeout) {
            this.clearTimeout(this._timeout);
        };
        this._timeout = this.setTimeout(()=>{
            this.fetchData();
        },2000);
    },
    fetchData: function(){
        attachAction.get({
            accessoryId: this.state.accessoryId
        });
    },
    _pressSettingButton: function(){
        Actions.attachSetting({
            title: '附件设置',
            data: this.state
        });
    },
    renderTime: function(timestamp){
        var time = moment(timestamp).format('YYYY年MM月DD日');
        return(
            <Text
            style={commonStyle.settingDetail}>
                {time}
            </Text>
            )
    },
    render: function(){
        return(
            <View style={commonStyle.container}>
                <NavigationBar
                    tintColor="#f9f9f9"
                    title={{ title: this.props.title}}
                    leftButton={<BlueBackButton />}
                    rightButton={<RightSettingButton onPress={this._pressSettingButton} />} />
                <ScrollView style={styles.main}>
                    <View style={styles.attachImageWrapper}>
                        <Image
                          source={{uri: this.state.absoluteUrl}}
                          style={styles.attachImageMiddle} />
                    </View>
                    <Text style={styles.attachTitle}>
                        {this.state.fileName}
                    </Text>
                    <TouchableHighlight
                        style={commonStyle.settingItemWrapper}
                        underlayColor='#eee'
                        onPress={this.cleanCache}>
                        <View
                        style={commonStyle.settingItem}>
                            <Text
                            style={[commonStyle.settingTitle, commonStyle.textLight]}>
                                上传人
                            </Text>
                            <Text
                            style={commonStyle.settingDetail}>
                                {this.state.userName}
                            </Text>
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight
                        style={commonStyle.settingItemWrapper}
                        underlayColor='#eee'>
                        <View
                        style={commonStyle.settingItem}>
                            <Text
                            style={[commonStyle.settingTitle, commonStyle.textLight]}>
                                时间
                            </Text>
                            {this.renderTime(this.state.gmtCreate)}
                        </View>
                    </TouchableHighlight>
                </ScrollView>
            </View>
            );
    }
})