'use strict';

import React, {
    View,
    Text,
    Image,
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
} from 'react-native'
import NavigationBar from '../../../common/react-native-navbar/index';

var Actions = require('react-native-router-flux').Actions;
var SearchBar = require('react-native-search-bar');
var moment = require('moment');
var underscore = require('underscore');
var TimerMixin = require('react-timer-mixin');



var commonStyle = require('../../../styles/commonStyle');
var styles = require('../../../styles/order/orderDetail');
var commentStyle = require('../../../styles/order/comment.js');

var util = require('../../../common/util');
var appConstants = require('../../../constants/appConstants');

var BlueBackButton = require('../../../common/blueBackButton');
var RightSettingButton = require('../../../common/rightSettingButton');

var CommentList = require('../comments/commentList');

var taskListAction = require('../../../actions/task/taskListAction');
var taskListStore = require('../../../stores/task/taskListStore');
var taskAction = require('../../../actions/task/taskAction');
var taskStore = require('../../../stores/task/taskStore');
var attachStore = require('../../../stores/attach/attachStore');
var employeeAction = require('../../../actions/employee/employeeAction');
var employeeStore = require('../../../stores/employee/employeeStore');

var TaskDependencesList = require('./taskDependencesList');
var SubTaskList = require('./subTaskList');

module.exports = React.createClass({
    mixins: [TimerMixin],
    displayName: 'taskDetail',
    getInitialState: function(){
        return {
            visibleHeight: Dimensions.get('window').height,
            taskId: this.props.data || 0,//任务id
            taskData: {}
        }
    },
    componentDidMount: function(){
        // this.keyShowListener = DeviceEventEmitter.addListener('keyboardWillShow', this.keyboardWillShow);
        // this.keyHideListener = DeviceEventEmitter.addListener('keyboardWillHide', this.keyboardWillHide);
        this.unlisten = taskStore.listen(this.onChange);
        this.unlistenAttach = attachStore.listen(this.onAttachChange);
        this.unlistenTaskList = taskListStore.listen(this.onTaskListChange);
        this.unlistenEmployee = employeeStore.listen(this.onEmployeeChange);
        this.generatorOwnerDataDebounce();
        if (this._timeout) {
            this.clearTimeout(this._timeout)
        };
        this._timeout = this.setTimeout(this.fetchData, 550);
        util.logPage('taskDetail');
    },
    componentWillUnmount: function() {
        this.unlisten();
        this.unlistenAttach();
        this.unlistenTaskList();
        this.unlistenEmployee();
        util.endLogPageView('taskDetail');
        // this.keyShowListener.remove();
        // this.keyHideListener.remove();
    },
    handleEmployeeGet: function(result){
        if (result.status != 200 && !!result.message) {
            util.alert(result.message);
            return;
        }
        this.ownerData = result.data;
        this._goContactDetail();
    },
    onEmployeeChange: function(){
        var result = employeeStore.getState();
        switch(result.type){
            case 'get':
                return this.handleEmployeeGet(result);
        }
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
        // console.log('----handleUpdate',this.state.taskData.id, result.data);
        // if (parseInt(result.data) != this.state.taskData.id) {
        //     return;
        // };
        // console.log('----handleUpdate');
        if (this._timeout) {
            this.clearTimeout(this._timeout)
        };
        this._timeout = this.setTimeout(this.fetchData, 550)
        // this.state.taskData.status = (this.state.taskData.done == 1) ? 0 : 1
        // this.setState({
        //     taskData: this.transformatData(this.state.taskData)
        // });
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
            taskId: this.state.taskId
        });
    },
    generatorOwnerDataDebounce: function(){
        var self = this;
        this._fetchOwnerDataDebounce = underscore.debounce(()=>{
            employeeAction.get({
                userId: self.state.taskData.ownerId
            });
        }, 300);
    },
    fetchOwnerData: function(){
        this._fetchOwnerDataDebounce();
    },
    onChange: function(){
        var result = taskStore.getState();
        // console.log('-----------task result', result);
        if (result.status != 200 && !!result.message) {
            return;
        };
        if (result.type == 'get') {
            this.setState({
                taskData: this.transformatData(result.data)
            });
            // console.log('----result', this.state.taskData);
            // if (this._timeout) {
            //     this.clearTimeout(this._timeout);
            // };
            // this._timeout = this.setTimeout(this.fetchOwnerData, 550);
        };
        if (result.type == 'update') {
            if (this._timeout) {
                this.clearTimeout(this._timeout)
            };
            this._timeout = this.setTimeout(this.fetchData, 550)
        };
    },
    transformatData: function(data){
        var endTime = data.endTime || new Date().valueOf();
        return Object.assign(data, {
            id: data.id || 0,
            done: data.status,
            endTime: endTime,
            endTimeFormat: moment(endTime).format('YYYY年MM月DD日'),
            ownerName: data.ownerName || ''

        })
    },
    // keyboardWillShow: function(e) {
    //     var newSize = Dimensions.get('window').height - e.endCoordinates.height
    //     this.setState({visibleHeight: newSize})
    // },
    // keyboardWillHide: function(e) {
    //     this.setState({visibleHeight: Dimensions.get('window').height})
    // },
    _pressSettingButton: function(){
        var data = Object.assign({taskStatus: 2}, this.state.taskData);
        console.log('-------_pressSettingButton');
        Actions.taskSettings({
            title: '任务设置',
            data: data
        });
    },
    _setEndTime: function(){
        Actions.calendar({
            target: 1,
            onCalendarPressDone: this.onCalendarPressDone
        });
    },
    onCalendarPressDone: function(date){
        // this.state.taskData.endTime =  moment(date).valueOf();
        // this.setState({
        //     taskData: this.transformatData(this.state.taskData)
        // });
        taskAction.update({
            taskId: this.state.taskData.taskId || 0,
            ownerId: this.state.taskData.ownerId || 0,
            description: this.state.taskData.description || '',
            taskTitle: this.state.taskData.taskTitle || '',
            endTime: moment(date).valueOf(),
            lastIds: this.state.taskData.lastIds || [],
            accessoryNum: this.state.taskData.accessoryNum || ''
        });
        // this.setState({
        //     endTime: moment(date).valueOf(),
        //     endTimeFormat: moment(date).format('YYYY年MM月DD日')
        // });
    },
    _goTaskAttachList: function(){
        var data = Object.assign({taskStatus: 2}, this.state.taskData);
        Actions.taskAttach({
            title: '任务设置',
            data: data
        });
    },
    _goOrderDetail: function(){
        Actions.orderDetail({
            title:'',
            data: this.state.taskData.orderId
        });
    },
    _goTaskDescribe: function(){
        if (!this.state.taskData.descriptionUrl || (this.state.taskData.descriptionUrl.length == 0)) {
            util.toast('暂无更多描述');
            return;
        };
        Actions.taskDescribe({
            title: '任务描述',
            descriptionUrl: this.state.taskData.descriptionUrl
        });
    },
    _goContactDetail: function(){
        if (!this.ownerData) {
            return;
        };
        Actions.contactDetail({
            title: this.ownerData.ownerName,
            data: this.ownerData
        });
    },
    onPressCircle: function(){//更新任务状态
        var status = (this.state.taskData.done == 1) ? 0 : 1
        AlertIOS.alert(
            '',
            '您确定要更改任务状态吗',
            [
                {text: '确定', onPress: () => {
                    taskAction.update({
                        taskId: this.state.taskData.taskId,
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
        if (!this.state.taskData.taskId) {
            return(
                <View />
                );
        }
        return(
            <CommentList data={this.state.taskData.taskId}/>
            )
    },
    sendComment: function(){
        Actions.createComment({
            data: this.state.taskData.taskId
        });
    },
    renderCommentBar: function(){
        if (!this.state.taskData.taskId) {
            return(
                <View />
                );
        }
        return(
            <View style={commentStyle.commentBarWrapper}>
                <TouchableOpacity onPress={this.sendComment}
                style={commentStyle.commentSendButtonWrapper}>
                    <Text style={[commentStyle.commentSendButton, commonStyle.blue]}>
                        发表评论
                    </Text>
                </TouchableOpacity>
            </View>
            )
    },
    _setTaskDependence: function(){
        var data = Object.assign({taskStatus: 2}, this.state.taskData);
        Actions.settingsWrapper({
            title:'前置任务',
            children: TaskDependencesList,
            target: 2,//用来区分任务列表标题前面的check icon
            data: data
        });
    },
    renderDependences: function(){
        if (!this.state.taskData.lastIds || this.state.taskData.lastIds.length == 0) {
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
                        style={[commonStyle.settingDetail, commonStyle.settingDetailTextRight]}>
                            {this.state.taskData.lastIds.length}
                        </Text>
                        <Image
                        style={commonStyle.settingArrow}
                        source={require('../../../images/common/arrow_right_gray.png')} />
                    </View>
                </TouchableHighlight>
                );
        }
    },
    renderAttachItem: function(){
        // console.log('---------this.state.taskData', this.state.taskData);
        if (this.state.taskData.accessoryNum > 0) {
            return(
                <TouchableHighlight
                underlayColor='#eee'
                onPress={this._goTaskAttachList} >
                    <View style={commonStyle.settingItemWrapper}>
                        <View
                        style={[commonStyle.settingItem, commonStyle.bottomBorder]} >
                            <Text
                            style={commonStyle.settingTitle}>
                                附件
                            </Text>
                            <Text
                            style={[commonStyle.settingDetail, commonStyle.settingDetailTextRight]}>
                            {this.state.taskData.accessoryNum}
                            </Text>
                            <Image
                        style={commonStyle.settingArrow}
                        source={require('../../../images/common/arrow_right_gray.png')} />
                        </View>
                    </View>
                </TouchableHighlight>
                );
        };
        return(<View />);
    },
    renderOverTime: function(){
        if (!this.state.taskData.finishedTime) {
            return(
                <View />
                );
        };
        var overTimeFormat = moment(this.state.taskData.finishedTime).format('YYYY年MM月DD日')
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
                    style={[commonStyle.settingDetail, commonStyle.settingDetailTextRight]}>
                        {overTimeFormat}
                    </Text>
                </View>
            </View>
            );
    },
    renderNavigationBar: function(){
        var rights = appConstants.userRights.rights;
        var targetRights = 128;
        var hasRights = (rights & targetRights) == targetRights;
        if (hasRights && !this.state.taskData.done){
            return(
                <NavigationBar
                    title={{ title: '任务详情'}}
                    tintColor="#f9f9f9"
                    leftButton={<BlueBackButton />}
                    rightButton={<RightSettingButton onPress={this._pressSettingButton} />} />
                );
        }else{
            return(
                <NavigationBar
                    tintColor="#f9f9f9"
                    title={{ title: '任务详情'}}
                    leftButton={<BlueBackButton />} />
                );
        }
    },
    onPressTaskRow: function(rowData){
        this.unlisten();
        this.unlistenAttach();
        this.unlistenTaskList();
        this.unlistenEmployee();
        Actions.taskDetail({
            title: rowData.taskTitle,
            data: rowData.taskId
        });
    },
    renderSubTask: function(){
        if (!this.state.taskData.subTaskList) {
            return(<View />);
        };
        return(
            <SubTaskList
            data={this.state.taskData.subTaskList}
            onPressRow={this.onPressTaskRow}/>
            );
    },
    renderContactItem: function(){
        return(
            <TouchableHighlight
            underlayColor='#eee'
            onPress={this.fetchOwnerData} >
                <View
                style={commonStyle.settingItemWrapper}>
                    <View
                    style={[commonStyle.settingItem, commonStyle.bottomBorder]}>
                        <Text
                        style={commonStyle.settingTitle}>
                            责任人
                        </Text>
                        <Text
                        style={[commonStyle.settingDetail, commonStyle.settingDetailTextRight]}>
                            {this.state.taskData.ownerName}
                        </Text>
                        <Image
                        style={commonStyle.settingArrow}
                        source={require('../../../images/common/arrow_right_gray.png')} />
                    </View>
                </View>
            </TouchableHighlight>
            );
    },
    render: function(){
        // <View style={styles.taskDetailDescribe}>
        //     <View style={commonStyle.textAreaWrapper}>
        //         <Text placeholder='任务描述'
        //         style={[commonStyle.textArea, commonStyle.textGray]}>
        //             {this.state.taskData.description}
        //          </Text>
        //     </View>
        // </View>
        return(
            <View style={{height: this.state.visibleHeight}} >
                {this.renderNavigationBar()}
                <ScrollView style={styles.main}
                keyboardDismissMode={'interactive'} >
                    <View style={styles.taskDetailTop}>
                        {this.renderCheckIcon()}
                        <Text placeholder='任务名称'
                        style={[styles.taskTitle]}>
                            {this.state.taskData.taskTitle}
                        </Text>
                    </View>
                    <TouchableHighlight
                    underlayColor='#eee'
                    onPress={this._goTaskDescribe} >
                        <View style={commonStyle.settingItemWrapper}>
                            <View
                            style={[commonStyle.settingItem, commonStyle.bottomBorder]} >
                                <Text
                                style={commonStyle.settingTitle}>
                                    任务描述
                                </Text>
                                <Text
                                style={[commonStyle.settingDetail, commonStyle.settingDetailTextRight]}
                                numberOfLines={1}>
                                {this.state.taskData.description}
                                </Text>
                                <Image
                                style={commonStyle.settingArrow}
                                source={require('../../../images/common/arrow_right_gray.png')} />
                            </View>
                        </View>
                    </TouchableHighlight>
                    {this.renderContactItem()}
                    <TouchableHighlight
                    style={commonStyle.settingItemWrapper}
                    underlayColor='#eee'
                    onPress={this._setEndTime}>
                        <View
                        style={[commonStyle.settingItem, commonStyle.bottomBorder]}>
                            <Text
                            style={commonStyle.settingTitle}>
                                截止日期
                            </Text>
                            <Text
                            style={[commonStyle.settingDetail, commonStyle.settingDetailTextRight]}>
                                {this.state.taskData.endTimeFormat}
                            </Text>
                            <Image
                            style={commonStyle.settingArrow}
                            source={require('../../../images/common/arrow_right_gray.png')} />
                        </View>
                    </TouchableHighlight>
                    {this.renderSubTask()}
                    {this.renderOverTime()}
                    {this.renderDependences()}
                    {this.renderAttachItem()}
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
                                style={[commonStyle.settingDetail, commonStyle.settingDetailTextRight]}
                                numberOfLines={1}>
                                {this.state.taskData.orderTitle}
                                </Text>
                                <Image
                            style={commonStyle.settingArrow}
                            source={require('../../../images/common/arrow_right_gray.png')} />
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