'use strict';
var React = require('react-native')
var NavigationBar = require('react-native-navbar');
var {
    Text,
    TextInput,
    View,
    ListView,
    Image,
    Navigator,
    TouchableHighlight,
    StyleSheet
} = React

var commonStyle = require('../../../styles/commonStyle');

var Calendar = require('../../calendar');
var Contact = require('../../contact/contact');
var SettingsWrapper = require('./settingsWrapper');
var TaskList = require('./taskList');
var _navigator, _topNavigator = null;

module.exports = React.createClass({
    getInitialState: function(){
        _navigator = this.props.navigator;
        _topNavigator = this.props.route.topNavigator;
        return {}
    },
    leftButtonConfig: {
        title: 'X',
        handler:() =>
            _navigator.pop()
    },
    rightButtonConfig: function(){
        var self = this;
        return{
            title: 'Done',
            handler:() =>
                _navigator.pop()
        }
    },
    _setEndTime: function(){
        _navigator.push({
            component: Calendar,
            sceneConfig: Navigator.SceneConfigs.FloatFromRight,
            topNavigator: _topNavigator
        });
    },
    _setCustomer: function(){
        _navigator.push({
            title:'客户',
            component: Contact,
            sceneConfig: Navigator.SceneConfigs.FloatFromRight,
            topNavigator: _topNavigator
        });
    },
    onPressTaskRow: function(){
        console.log('----on tap');
    },
    _setTaskDependence: function(){
        //todo: 把settingwrapper修改为presettings
        _navigator.push({
            title:'前置任务',
            component: SettingsWrapper,
            children: TaskList,
            onPressRow: this.onPressTaskRow,
            sceneConfig: Navigator.SceneConfigs.FloatFromRight,
            topNavigator: _topNavigator
        });
    },
    _setOrderBelongs: function(){
        _navigator.push({
            title:'所属订单',
            component: Contact,
            sceneConfig: Navigator.SceneConfigs.FloatFromRight,
            topNavigator: _topNavigator
        });
    },
    render: function(){
        return(
            <View style={commonStyle.container}>
                <NavigationBar
                    title={{title:'新建任务'}}
                    leftButton={this.leftButtonConfig}
                    rightButton={this.rightButtonConfig()}/>
                <View style={styles.main}>
                    <View style={commonStyle.textInputWrapper}>
                        <TextInput placeholder='任务名称'
                        style={commonStyle.textInput}
                        clearButtonMode={'while-editing'}/>
                    </View>
                    <View style={commonStyle.textInputWrapper}>
                        <TextInput placeholder='任务描述'
                        style={commonStyle.textInput}
                        clearButtonMode={'while-editing'}
                        multiline={true} />
                    </View>
                    <TouchableHighlight
                    style={commonStyle.settingItemWrapper}
                    underlayColor='#eee'
                    onPress={this._setEndTime}>
                        <View style={commonStyle.settingItem}>
                            <Text
                            style={commonStyle.settingTitle}>
                                截止日期
                            </Text>
                            <Text
                            style={commonStyle.settingDetail}>
                                2015年x月x日
                            </Text>
                            <Image
                            style={commonStyle.settingArrow}
                            source={require('../../../images/Arrow_back.png')} />
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight
                    style={commonStyle.settingItemWrapper}
                    underlayColor='#eee'
                    onPress={this._setCustomer}>
                        <View style={commonStyle.settingItem}>
                            <Text
                            style={commonStyle.settingTitle}>
                                负责人
                            </Text>
                            <Text
                            style={commonStyle.settingDetail}>
                                我是xx
                            </Text>
                            <Image
                            style={commonStyle.settingArrow}
                            source={require('../../../images/Arrow_back.png')} />
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight
                    style={commonStyle.settingItemWrapper}
                    underlayColor='#eee'
                    onPress={this._setTaskDependence} >
                        <View style={commonStyle.settingItem}>
                            <Text
                            style={commonStyle.settingTitle}>
                                前置任务
                            </Text>
                            <Text
                            style={commonStyle.settingDetail}>
                                2
                            </Text>
                            <Image
                            style={commonStyle.settingArrow}
                            source={require('../../../images/Arrow_back.png')} />
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight
                    style={commonStyle.settingItemWrapper}
                    underlayColor='#eee'
                    onPress={this._setCustomer} >
                        <View style={commonStyle.settingItem}>
                            <Text
                            style={commonStyle.settingTitle}>
                                所属订单
                            </Text>
                            <Text
                            style={commonStyle.settingDetail}>
                                2asdfasd3
                            </Text>
                            <Image
                            style={commonStyle.settingArrow}
                            source={require('../../../images/Arrow_back.png')} />
                        </View>
                    </TouchableHighlight>
                </View>
            </View>
            );
    }
});

var styles = StyleSheet.create({
    main: {
        flex: 1,
        // justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    }
});