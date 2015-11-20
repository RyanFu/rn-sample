'use strict';

var React = require('react-native');
var {StyleSheet, TabBarIOS} = React;

var AppNavigator = require('../common/navbar');
var Home = require('../views/home/home');
var tabViewSample = require('../views/tabViewSample');
//获取可视窗口的宽高
var util = require('../common/util.js');
var {
    width, height, scale
} = util.getDimensions();

var Launch = React.createClass({
    getInitialState: function () {
        return {
            selectedTab: 'Workspace',
            notifCount: 0,
            presses: 0,
        };
    },

    _handlePress: function (tab) {
        var self = this;
        return function () {
            self.setState({
                selectedTab: tab,
                notifCount: self.state.notifCount + 1,
            });
        }
    },
    render: function() {
        return (
            <TabBarIOS
                tintColor = "#333"
                barTintColor = "#fff">
                <TabBarIOS.Item
                    title="Workspace"
                    badge={this.state.notifCount > 0 ? this.state.notifCount : undefined}
                    icon={require('../images/TabBar/Workspace.png')}
                    selectedIcon={require('../images/TabBar/Workspace_hover.png')}
                    selected={this.state.selectedTab === 'Workspace'}
                    onPress={this._handlePress("Workspace")}>
                    <AppNavigator initialRoute={{title: 'Workspace', component:Home, topNavigator: this.props.navigator}} key='Workspace' />
                </TabBarIOS.Item>
                <TabBarIOS.Item
                    title="Order"
                    icon={require('../images/TabBar/Order.png')}
                    selectedIcon={require('../images/TabBar/Order_hover.png')}
                    selected={this.state.selectedTab === 'Order'}
                    onPress={this._handlePress("Order")}>
                    <AppNavigator initialRoute={{title: 'Order', component:tabViewSample, topNavigator: this.props.navigator}} key='Order' />
                </TabBarIOS.Item>
                <TabBarIOS.Item
                    title="Inbox"
                    icon={require('../images/TabBar/Inbox.png')}
                    selectedIcon={require('../images/TabBar/Inbox_hover.png')}
                    selected={this.state.selectedTab === 'Inbox'}
                    onPress={this._handlePress("Inbox")}>
                    <AppNavigator initialRoute={{title: 'Inbox', component:tabViewSample, topNavigator: this.props.navigator}} key='Inbox' />
                </TabBarIOS.Item>
                <TabBarIOS.Item
                    title="Contact"
                    icon={require('../images/TabBar/Contact.png')}
                    selectedIcon={require('../images/TabBar/Contact_hover.png')}
                    selected={this.state.selectedTab === 'Contact'}
                    onPress={this._handlePress("Contact")}>
                    <AppNavigator initialRoute={{title: 'Contact', component:tabViewSample, topNavigator: this.props.navigator}} key='Contact' />
                </TabBarIOS.Item>
                <TabBarIOS.Item
                    title="Person"
                    icon={require('../images/TabBar/Person.png')}
                    selectedIcon={require('../images/TabBar/Person_hover.png')}
                    selected={this.state.selectedTab === 'Person'}
                    onPress={this._handlePress("Person")}>
                    <AppNavigator initialRoute={{title: 'Person', component:tabViewSample, topNavigator: this.props.navigator}} key='Person' />
                </TabBarIOS.Item>
            </TabBarIOS>
        );
    }
});

module.exports = Launch;