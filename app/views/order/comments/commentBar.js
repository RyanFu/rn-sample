'use strict';
var React = require('react-native')
var Actions = require('react-native-router-flux').Actions;
var TimerMixin = require('react-timer-mixin');
var {
    Text,
    TextInput,
    Image,
    View,
    ListView,
    TouchableOpacity,
    ActivityIndicatorIOS,
    StyleSheet
} = React

var commentAction = require('../../../actions/comment/commentAction');
var commentStore = require('../../../stores/comment/commentStore');
var util = require('../../../common/util');

var styles = require('../../../styles/order/comment.js');
var commonStyle = require('../../../styles/commonStyle');

var CompanyMemberList = require('../../contact/companyMemberList');
module.exports = React.createClass({
    mixins: [TimerMixin],
    displayName: 'commentBar',
    getInitialState: function() {
        return {
            targetId: this.props.data,//任务id
            atUserIds: [],
            comment: '',
            type: 2
        }
    },
    componentDidMount: function(){
        this.unlisten = commentStore.listen(this.onChange);
    },
    componentWillUnmount: function() {
        this.unlisten();
    },
    onChange: function(){
        var result = commentStore.getState();
        if (result.status != 200 && !!result.message) {
            return;
        }
        if (result.type == 'create') {
            this.setState({
                comment: ''
            });
        };
    },
    onPressContactRow: function(data){
        var text = this.state.comment.substring(0, this.state.comment.length - 1);
        var ids = this.state.atUserIds;
        ids.push(data.userId);
        this.setState({
            comment: text,
            atUserIds: ids
        });
    },
     _setRelatedPerson: function(){//增加@的人
        Actions.companyMemberList({
            title:'责任人',
            target: 1,
            onPressContactRow: this.onPressContactRow
        });
    },
    onChangeComment: function(text){
        var reg = /@$/;
        if (reg.test(text)) {
            this._setRelatedPerson();
        }
        this.setState({
            comment: text
        });
    },
    sendComment: function(){
        commentAction.create({
            targetId: this.state.targetId,
            atUserIds: this.state.atUserIds,
            comment: this.state.comment,
            type: 2
        });
    },
    render: function() {
        return(
            <View style={styles.commentBarWrapper}>
                <TextInput placeholder='通过@提醒特定成员'
                        style={styles.commentTextInput}
                        clearButtonMode={'while-editing'}
                        onChangeText={this.onChangeComment}
                        returnKeyType={'send'}
                        value={this.state.comment}
                        onSubmitEditing={this.sendComment} />
                <TouchableOpacity onPress={this.sendComment}
                style={styles.commentSendButtonWrapper}>
                    <Text style={[styles.commentSendButton, commonStyle.blue]}>
                        发送
                    </Text>
                </TouchableOpacity>
            </View>
            );
    }
});