'use strict';

var React = require('react-native');
import NavigationBar from 'react-native-navbar'
var SearchBar = require('react-native-search-bar');
var moment = require('moment');
var underscore = require('underscore');
var TimerMixin = require('react-timer-mixin');
var {
    View,
    Text,
    Image,
    Navigator,
    ListView,
    ScrollView,
    TouchableHighlight,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ActionSheetIOS,
    DeviceEventEmitter,
    Dimensions,
    AlertIOS,
    StyleSheet
} = React;

var _navigator, _topNavigator = null;

var commonStyle = require('../../../styles/commonStyle');
var styles = require('../../../styles/order/orderDetail');
var util = require('../../../common/util');
var appConstants = require('../../../constants/appConstants');

var BlueBackButton = require('../../../common/blueBackButton');
var RightSettingButton = require('../../../common/rightSettingButton');

var CommentList = require('../comments/commentList');
var CommentBar = require('../comments/commentBar');

// var OrderDetail = require('../orderDetail');

var taskListAction = require('../../../actions/task/taskListAction');
var taskListStore = require('../../../stores/task/taskListStore');
var taskAction = require('../../../actions/task/taskAction');
var taskStore = require('../../../stores/task/taskStore');
var attachStore = require('../../../stores/attach/attachStore');

var TaskSettings = require('./taskSettings');
var SettingsWrapper = require('./settingsWrapper');
var TaskList = require('./taskList');
var TaskAttach = require('../attach/taskAttach');

module.exports = React.createClass({
    mixins: [TimerMixin],
    displayName: 'taskDetail',
    getInitialState: function(){
        _navigator = this.props.navigator;
        _topNavigator = this.props.route.topNavigator;
        return {
            visibleHeight: Dimensions.get('window').height,
            jobId: this.props.route.data || 0,//任务id
            taskData: {}
        }
    },
    componentDidMount: function(){
        this.keyShowListener = DeviceEventEmitter.addListener('keyboardWillShow', this.keyboardWillShow);
        this.keyHideListener = DeviceEventEmitter.addListener('keyboardWillHide', this.keyboardWillHide);
        this.unlistenAttach = attachStore.listen(this.onAttachChange);
        this.unlisten = taskStore.listen(this.onChange);
        this.unlistenTaskList = taskListStore.listen(this.onTaskListChange)
        if (this._timeout) {
            this.clearTimeout(this._timeout)
        };
        this._timeout = this.setTimeout(this.fetchData, 550)
    },
    componentWillUnmount: function() {
        this.unlistenAttach();
        this.unlisten();
        this.unlistenTaskList();
        this.keyShowListener.remove();
        this.keyHideListener.remove();
    },
    onAttachChange: function(){
        var result = attachStore.getState();
        if (result.status != 200 && !!result.message) {
            return;
        }
        if (result.type == 'create') {
            if (this._timeout) {
                this.clearTimeout(this._timeout)
            };
            this._timeout = this.setTimeout(this.fetchData, 550)
        };
    },
    handleUpdate: function(result){
        if (parseInt(result.data) != this.state.taskData.id) {
            return;
        };
        this.state.taskData.status = (this.state.taskData.done == 1) ? 0 : 1
        this.setState({
            taskData: this.transformatData(this.state.taskData)
        });
    },
    onTaskListChange: function(){
        var result = taskListStore.getState();
        if (result.status != 200 && !!result.message) {
            return;
        }
        switch(result.type){
            case 'update':
                return this.handleUpdate(result);
        }
    },
    fetchData: function(){
        taskAction.get({
            jobId: this.state.jobId
        });
    },
    onChange: function(){
        var result = taskStore.getState();
        if (result.status != 200 && !!result.message) {
            return;
        };
        if (result.type == 'get') {
            this.setState({
                taskData: this.transformatData(result.data)
            });
        };
    },
    transformatData: function(data){
        var endTime = data.endTime || new Date().valueOf();
        return Object.assign(data, {
            id: data.id || 0,
            done: data.status,
            endTime: endTime,
            endTimeFormat: moment(endTime).format('YYYY年MM月DD日'),
            userName: data.owner || ''

        })
    },
    keyboardWillShow: function(e) {
        var newSize = Dimensions.get('window').height - e.endCoordinates.height
        this.setState({visibleHeight: newSize})
    },
    keyboardWillHide: function(e) {
        this.setState({visibleHeight: Dimensions.get('window').height})
    },
    _pressSettingButton: function(){
        var data = Object.assign({taskStatus: 2}, this.state.taskData);
        _navigator.push({
            title: '任务设置',
            data: data,
            component: TaskSettings,
            sceneConfig: Navigator.SceneConfigs.FloatFromRight,
            topNavigator: _topNavigator
        });
    },
    _goTaskAttachList: function(){
        var data = Object.assign({taskStatus: 2}, this.state.taskData);
        _navigator.push({
            title: '任务设置',
            data: data,
            component: TaskAttach,
            sceneConfig: Navigator.SceneConfigs.FloatFromRight,
            topNavigator: _topNavigator
        });
    },
    _goOrderDetail: function(){
        _navigator.pop();
    },
    onPressCircle: function(){//更新任务状态
        var status = (this.state.taskData.done == 1) ? 0 : 1
        AlertIOS.alert(
            '',
            '您确定要更改任务状态吗',
            [
                {text: '确定', onPress: () => {
                    taskListAction.update({
                        id: this.state.taskData.id,
                        status: status,
                    });
                } },
                {text: '取消', onPress: () => {return}, style: 'cancel'},
            ]
        )
    },
    renderCheckIcon: function(){
        var circleImage = (this.state.taskData.done == 1) ? require('../../../images/task/task_status_done.png') : require('../../../images/task/task_status.png')
        return(
            <TouchableWithoutFeedback
            onPress={this.onPressCircle} >
                <View style={[styles.checkIconWrapper, styles.taskDetailCheckIcon]}>
                    <Image source={circleImage} />
                </View>
            </TouchableWithoutFeedback>
            )
    },
    renderCommentList: function(){
        if (!this.state.taskData.id) {
            return(
                <View />
                );
        }
        return(
            <CommentList data={this.state.taskData.id}/>
            )
    },
    renderCommentBar: function(){
        if (!this.state.taskData.id) {
            return(
                <View />
                );
        }
        return(
            <CommentBar navigator={_navigator} data={this.state.taskData.id}/>
            )
    },
    _setTaskDependence: function(){
        var data = Object.assign({taskStatus: 2}, this.state.taskData);
        _navigator.push({
            title:'前置任务',
            component: SettingsWrapper,
            children: TaskList,
            target: 2,//用来区分任务列表标题前面的check icon
            data: data,
            sceneConfig: Navigator.SceneConfigs.FloatFromRight,
            topNavigator: _topNavigator
        });
    },
    renderDependences: function(){
        if (!this.state.taskData.lastIdList || this.state.taskData.lastIdList.length == 0) {
            return(<View />)
        }else{
            return(
                <TouchableHighlight
                style={commonStyle.settingItemWrapper}
                underlayColor='#eee'
                onPress={this._setTaskDependence} >
                    <View
                    style={[commonStyle.settingItem, commonStyle.bottomBorder]}>
                        <Text
                        style={commonStyle.settingTitle}>
                            前置任务
                        </Text>
                        <Text
                        style={commonStyle.settingDetail}>
                            {this.state.taskData.lastIdList.length}
                        </Text>
                        <Image
                        style={commonStyle.settingArrow}
                        source={require('../../../images/common/arrow_right.png')} />
                    </View>
                </TouchableHighlight>
                );
        }
    },
    renderOverTime: function(){
        if (!this.state.taskData.overTime) {
            return(
                <View />
                );
        };
        var overTimeFormat = moment(this.state.taskData.overTime).format('YYYY年MM月DD日')
        return(
            <View
            style={commonStyle.settingItemWrapper} >
                <View
                style={[commonStyle.settingItem, commonStyle.bottomBorder]}>
                    <Text
                    style={commonStyle.settingTitle}>
                        完成日期
                    </Text>
                    <Text
                    style={commonStyle.settingDetail}>
                        {overTimeFormat}
                    </Text>
                </View>
            </View>
            );
    },
    renderNavigationBar: function(){
        var rights = appConstants.userRights.rights;
        var targetRights = 128;
        if ((rights & targetRights) == targetRights){
            return(
                <NavigationBar
                    title={{ title: '任务详情'}}
                    leftButton={<BlueBackButton navigator={_topNavigator} />}
                    rightButton={<RightSettingButton onPress={this._pressSettingButton} />} />
                );
        }else{
            return(
                <NavigationBar
                    title={{ title: '任务详情'}}
                    leftButton={<BlueBackButton navigator={_topNavigator} />} />
                );
        }
    },
    render: function(){
        return(
            <View style={{height: this.state.visibleHeight}} >
                {this.renderNavigationBar()}
                <ScrollView style={styles.main}
                keyboardDismissMode={'interactive'} >
                    <View style={styles.taskDetailTop}>
                        {this.renderCheckIcon()}
                        <Text placeholder='任务名称'
                        style={[styles.taskTitle]}>
                            {this.state.taskData.jobName}
                        </Text>
                    </View>
                    <View style={styles.taskDetailDescribe}>
                        <View style={commonStyle.textAreaWrapper}>
                            <Text placeholder='任务描述'
                            style={commonStyle.textArea}>
                                {this.state.taskData.description}
                             </Text>
                        </View>
                    </View>
                    <View
                    style={commonStyle.settingItemWrapper}>
                        <View
                        style={[commonStyle.settingItem, commonStyle.bottomBorder]}>
                            <Text
                            style={commonStyle.settingTitle}>
                                负责人
                            </Text>
                            <Text
                            style={commonStyle.settingDetail}>
                                {this.state.taskData.userName}
                            </Text>
                        </View>
                    </View>
                    <View
                    style={commonStyle.settingItemWrapper} >
                        <View
                        style={[commonStyle.settingItem, commonStyle.bottomBorder]}>
                            <Text
                            style={commonStyle.settingTitle}>
                                截止日期
                            </Text>
                            <Text
                            style={commonStyle.settingDetail}>
                                {this.state.taskData.endTimeFormat}
                            </Text>
                        </View>
                    </View>

                    {this.renderOverTime()}
                    {this.renderDependences()}
                    <TouchableHighlight
                    underlayColor='#eee'
                    onPress={this._goTaskAttachList} >
                        <View style={commonStyle.settingItemWrapper}>
                            <View
                            style={commonStyle.settingItem} >
                                <Text
                                style={commonStyle.settingTitle}>
                                    附件
                                </Text>
                                <Text
                                style={commonStyle.settingDetail}>
                                {this.state.taskData.accessoryNum}
                                </Text>
                                <Image
                            style={commonStyle.settingArrow}
                            source={require('../../../images/common/arrow_right.png')} />
                            </View>
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight
                    underlayColor='#eee'
                    onPress={this._goOrderDetail} >
                        <View style={commonStyle.settingItemWrapper}>
                            <View
                            style={commonStyle.settingItem} >
                                <Text
                                style={commonStyle.settingTitle}>
                                    所属订单
                                </Text>
                                <Text
                                style={commonStyle.settingDetail}>
                                {this.state.taskData.orderTitle}
                                </Text>
                                <Image
                            style={commonStyle.settingArrow}
                            source={require('../../../images/common/arrow_right.png')} />
                            </View>
                        </View>
                    </TouchableHighlight>

                    {this.renderCommentList()}
                </ScrollView>
                {this.renderCommentBar()}
            </View>
            );
    }
})