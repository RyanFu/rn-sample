'use strict';

var React = require('react-native');
var NavigationBar = require('react-native-navbar');
var SearchBar = require('react-native-search-bar');
var {
    View,
    Text,
    Image,
    Navigator,
    ScrollView,
    TouchableOpacity,
    ActionSheetIOS,
    StyleSheet
} = React;

var _navigator, _topNavigator = null;

var commonStyle = require('../../styles/commonStyle');
var contactsStyle = require('../../styles/contact/contactsItem');
var ContactDetail = require('./contactDetail');
var ContactList = require('./contactList');

var BlueBackButton = require('../../common/blueBackButton');

var contactAction = require('../../actions/contact/contactAction');
var contactStore = require('../../stores/contact/contactStore');

var util = require('../../common/util');
/*
target: 表示从哪里打开通讯录 enum
{
    1: 'createTask',
    2: 'createOrder'
    3: 'normal'
}
*/
module.exports = React.createClass({
    getInitialState: function(){
        _navigator = this.props.navigator;
        _topNavigator = this.props.route.topNavigator;
        return {
            target: this.props.route.target || 3,
            listData: [],
        }
    },
    componentDidMount: function(){
        contactAction.getList();
        this.unlisten = contactStore.listen(this.onChange)
    },
    componentWillUnmount: function() {
        this.unlisten();
    },
    onChange: function() {
        var result = contactStore.getState();
        if (result.type != 'get') { return; };
        if (result.status != 200 && !!result.message) {
            util.alert(result.message);
            return;
        }
        var customerListData = this.transformList(result.data);
        this.setState({
            listData: customerListData
        });
    },
    transformList: function(list){
        var result = [];
        for (var i = 0; i < list.length; i++) {
            (list[i]['group'] == 2) && result.push(list[i]);
        };
        return result;
    },
    onPressRow: function(data){
        if (this.state.target == 3) {
            _topNavigator.push({
                title: data.userName,
                data: data,
                component: ContactDetail,
                sceneConfig: Navigator.SceneConfigs.FloatFromRight,
                topNavigator: _topNavigator
            })
            return;
        }else{
            this.props.route.onPressContactRow(data);
            _topNavigator.pop();
        }
    },
    leftButtonConfig:function() {
        return {
            title: '<',
            handler:() =>
                _navigator.pop()
        }
    },
    renderNavigationBar: function(){
        if (this.state.target == 3) {
            return(
                <NavigationBar
                    title={{ title: this.props.route.title }} />
                );

        }else{
            return(
                <NavigationBar
                    title={{ title: this.props.route.title }}
                    leftButton={<BlueBackButton navigator={_navigator}/>} />
                );
        }
    },
    render: function(){
        return(
            <View style={commonStyle.container}>
                {this.renderNavigationBar()}
                <ScrollView style={commonStyle.container}
                contentOffset={{y: 44}}
                contentInset={{bottom: 40}}
                automaticallyAdjustContentInsets={false} >
                    <SearchBar
                        placeholder='Search'
                        textFieldBackgroundColor='#fff'
                        barTintColor='#bdbdbd'
                        tintColor='#333' />
                    <ContactList
                        style={contactsStyle.scrollView}
                        data={this.state.listData}
                        onPressRow={this.onPressRow} />
                </ScrollView>
            </View>
            );
    }
});