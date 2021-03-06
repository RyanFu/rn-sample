'use strict';

var React = require('react-native');
var PhonePicker = require('react-native-phone-picker');
var TimerMixin = require('react-timer-mixin');
var {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    TouchableHighlight,
    ActionSheetIOS,
    StyleSheet
} = React;

var commonStyle = require('../../styles/commonStyle');
var contactsStyle = require('../../styles/contact/contactsItem');
var appConstants = require('../../constants/appConstants');
var asyncStorage = require('../../common/storage');


module.exports = React.createClass({
    mixins: [TimerMixin],
    getInitialState: function(){
        return {
            factoryName: !!appConstants.user ? appConstants.user.factoryName : ''
        }
    },
    componentWillReceiveProps: function(){
        this.setState({
            factoryName: !!appConstants.user ? appConstants.user.factoryName : ''
        });
    },
    componentDidMount: function(){
        this.getAppConstants();
    },
    componentWillUnmount: function() {
    },
    getAppConstants: function(){
        var self = this;
        asyncStorage.getItem('appConstants')
        .then((data)=>{
            if(!!data && !!data.xAuthToken){
                appConstants = data;
                this.setTimeout(function(){
                    self.setState({
                        factoryName: !!appConstants.user ? appConstants.user.factoryName : ''
                    });
                }, 350)
            }
        }).done();
    },
    openAddress: function(){
        PhonePicker.select(function(person) {
            if (person) {
                var phone = person.phone.replace(/[^\d]/g, '');
                if (/^1[3|4|5|6|7|8|9][0-9]\d{8}$/.test(phone)) {
                    console.log(phone);
                }
            }
        })
    },
    renderApplicationItem: function(){
        var rights = appConstants.userRights.rights;
        var targetRights = 4194304;
        if ((rights & targetRights) == targetRights){
            return(
                <TouchableHighlight
                onPress={this.props.goApplicationList}
                underlayColor='#eee'>
                <View style={contactsStyle.contactsItem}>
                    <Image
                    style={contactsStyle.contactsItemCircle}
                    source={require('../../images/contact/group_add_circle.png')} />
                    <Text style={contactsStyle.contactsItemDetail}>新的成员</Text>
                </View>
            </TouchableHighlight>
            )
        }else{
            return(
                <View />
                )
        }
    },
    renderCustomerItem: function(){
        var rights = appConstants.userRights.rights;
        var targetRights = 65536;
        if ((rights & targetRights) == targetRights){
            return(
                <TouchableHighlight
                onPress={this.props.goCustomerList}
                underlayColor='#eee'>
                <View style={contactsStyle.contactsItem}>
                    <Image
                    style={contactsStyle.contactsItemCircle}
                    source={require('../../images/contact/Client_yel.png')} />
                    <Text style={contactsStyle.contactsItemDetail}>客户</Text>
                </View>
            </TouchableHighlight>
            )
        }else{
            return(
                <View />
                )
        }
    },
    renderFactoryItem: function(){
        if (!this.state.factoryName) {
            return(
                <TouchableHighlight
                onPress={this.props.goCompanyWelcom}
                underlayColor='#eee'>
                    <View style={contactsStyle.contactsItem}>
                        <Image
                            style={contactsStyle.contactsItemCircle}
                            source={require('../../images/contact/organization.png')} />
                        <Text style={contactsStyle.contactsItemDetail}>组织架构</Text>
                        <Text style={[contactsStyle.contactRightText, commonStyle.blue]}>
                            加入/新建
                        </Text>
                    </View>
                </TouchableHighlight>
                );
        }else{
            return(
                <TouchableHighlight
                onPress={this.props.goCompanyMemberList}
                underlayColor='#eee'>
                    <View style={contactsStyle.contactsItem}>
                        <Image
                            style={contactsStyle.contactsItemCircle}
                            source={require('../../images/contact/organization.png')} />
                        <Text style={contactsStyle.contactsItemDetail}>{this.state.factoryName}</Text>
                    </View>
                </TouchableHighlight>
                );
        }
    },
    render: function(){
        var circleBackground = {
            backgroundColor: '#ff7300'
        }
        return(
            <View style={[commonStyle.container, this.props.style]}>
                <ScrollView
                  style={contactsStyle.scrollView}>
                    {this.renderFactoryItem()}
                    {this.renderCustomerItem()}
                    {this.renderApplicationItem()}
                    <TouchableHighlight
                    underlayColor='#eee'
                    onPress={this.openAddress} >
                        <View style={contactsStyle.contactsItem}>
                            <Image
                            style={contactsStyle.contactsItemCircle}
                            source={require('../../images/contact/Phone-contacts-circle.png')} />
                            <Text style={contactsStyle.contactsItemDetail}>手机通讯录</Text>
                        </View>
                    </TouchableHighlight>
                </ScrollView>
            </View>
            );
    }
});