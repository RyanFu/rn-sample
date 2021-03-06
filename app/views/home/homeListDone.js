'use strict';
var React = require('react-native')
var Actions = require('react-native-router-flux').Actions;
var TimerMixin = require('react-timer-mixin');
var {
    Text,
    View,
    ListView,
    ScrollView,
    RefreshControl,
    Image,
    TouchableOpacity,
    ActivityIndicatorIOS,
    StyleSheet
} = React

var workbenchDoneListAction = require('../../actions/workbench/workbenchDoneListAction');
var workbenchDoneListStore = require('../../stores/workbench/workbenchDoneListStore');
var taskListStore = require('../../stores/task/taskListStore');
var taskListAction = require('../../actions/task/taskListAction');
var taskStore = require('../../stores/task/taskStore');

var styles = require('../../styles/home/style.js');
var commonStyle = require('../../styles/commonStyle');

var util = require('../../common/util');

var HomeTaskItemDone = require('./homeTaskItemDone');
var Button = require('../../common/button.js');

var appConstants = require('../../constants/appConstants');
var asyncStorage = require('../../common/storage');

module.exports = React.createClass({
    mixins: [TimerMixin],
    getInitialState: function() {
        var ds = new ListView.DataSource({
            // rowHasChanged: (r1, r2) => r1 !== r2
            rowHasChanged: (r1, r2) => true////为了在swipe的时候刷新列表
        });
        return {
            status: this.props.status,
            pageNum: 1,
            pageSize: 20,
            loaded : false,
            list: [],
            dataSource: ds,
            scrollEnabled: true,
            factoryName: !!appConstants.user ? appConstants.user.factoryName : ''
        }
    },
    _allowScroll: function(scrollEnabled) {
       this.setState({ scrollEnabled: scrollEnabled })
    },

    componentWillReceiveProps: function(nextProps){
        this.setState({
            status: nextProps.status
        });
        if (this._timeout) {
            this.clearTimeout(this._timeout)
        };
        if (nextProps.status != this.props.status) {
            this._timeout = this.setTimeout(this.onRefresh, 15)
        };
    },
    componentDidMount: function(){
        this.setTimeout(this.onRefresh, 350)
        this.unlisten = workbenchDoneListStore.listen(this.onChange);
        this.unlistenTaskChange = taskStore.listen(this.onTaskChange)
        this.unlistenTaskListChange = taskListStore.listen(this.onTaskListChange)
        this.getAppConstants();
    },
    componentWillUnmount: function() {
        this.unlisten();
        this.unlistenTaskChange();
        this.unlistenTaskListChange();
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
    getSectionData: function(dataBlob, sectionID){
        return dataBlob[sectionID];
    },
    getRowData: function(dataBlob, sectionID, rowID){
        return dataBlob[sectionID + ':' + rowID];
    },
    renderRow: function(rowData, sectionID, rowID) {
        return (
            <HomeTaskItemDone rowData={rowData} sectionID={sectionID}
            rowID={rowID}
            onPressRow={this.props.onPressRow} />
            )
    },
    renderSectionHeader: function(sectionData, sectionID){
        return(
            <View style={[styles.sectionHeder]}>
                <Text style={[styles.sectionText,commonStyle.blue]}
                numberOfLines={1} >
                    {sectionData.groupName}
                </Text>
            </View>
            )
    },
    onTaskListChange: function(){
        var result = taskListStore.getState();
        if (result.type == 'deleteHomeTask') {
            util.toast(result.message);
            if (result.status != 200 && !!result.message) {
                return;
            }
            if (this._timeout) {
                this.clearTimeout(this._timeout)
            };
            this.setTimeout(this.onRefresh, 350)
        };

    },
    onTaskChange: function(){
        var result = taskStore.getState();
        if (result.status != 200 && !!result.message) {
            util.alert(result.message);
            return;
        }
        if (result.type == 'create') {
            this.setTimeout(this.onRefresh, 350)
        };
        if (result.type == 'update') {
            if (result.status != 200 && !!result.message) {
                return;
            }
            util.toast('修改成功');
            if (this._timeout) {
                this.clearTimeout(this._timeout)
            };
            this.setTimeout(this.onRefresh, 350)
        };
    },
    handleGet: function(result, isLoadmore){
        if (result.status != 200 && !!result.message) {
            this.setState({
                loaded: true,
                list: []
            })
            return;
        }
        this.setState({
            dataSource : this.state.dataSource.cloneWithRows(result.data || []),
            list: result.data || [],
            loaded     : true,
            total: result.total,
            isRefreshing: false
        });
        if (!this.state.factoryName) {
            var self = this;
            if (this._timeout) {this.clearTimeout(this._timeout)};
            this._timeout = this.setTimeout(function() {
                self.goCreateFactory();
            }, 350);
        }
        // this.transfromDataBlob(result);
        // this.setState({isRefreshing: false});
        // !isLoadmore && this.list.hideHeader();
        // !!isLoadmore && this.list.hideFooter();
    },
    onChange: function() {
        var result = workbenchDoneListStore.getState();
        console.log('----------workbenchDoneListStore', result);
        if (result.status != 200 && !!result.message) {
            util.alert(result.message);
            return;
        }
        switch(result.type){
            case 'get':
                return this.handleGet(result);
            case 'loadmore':
                return this.handleGet(result, true)
        }
    },
    onRefresh: function() {
        this.setState({
            pageNum: 1,
            isRefreshing: true
        });
        workbenchDoneListAction.getList({
            status: this.state.status,
            pageNum: this.state.pageNum,
            pageSize: this.state.pageSize
        });
    },
    onInfinite: function() {
        console.log('----onInfinite', this.loadedAllData());
        if (!!this.loadedAllData()) {
            return;
        };

        this.setState({
            pageNum: this.state.pageNum + 1
        });
        workbenchDoneListAction.loadMore({
            status: this.state.status,
            pageNum: this.state.pageNum,
            pageSize: this.state.pageSize
        });
    },
    loadedAllData: function() {
        return this.state.list.length >= this.state.total||this.state.list.length===0;
    },
    render: function() {
        if (!this.state.loaded) {
            return this.renderLoadingView();
        }
        return this.renderListView();
    },
    goCreateFactory: function(){
        Actions.companyWelcome({
            title: '新建或加入企业'
        });
    },
    renderEmptyRow: function(){
         if (!this.state.factoryName) {
            return (
                <View style={commonStyle.emptyView}>
                    <Image source={require('../../images/empty/no_task_gray.png')} />
                    <Text style={{fontSize:20, fontWeight:'800', paddingTop: 16, color:'#bdbdbd'}}>
                        您还没有加入企业
                    </Text>
                    <Button
                    style={[commonStyle.button,, commonStyle.blue, {marginTop: 16}]}
                    onPress={this.goCreateFactory} >
                        新建 / 加入企业
                    </Button>
                </View>
            )
         }else{
            return (
                <View style={commonStyle.emptyView}>
                    <Image source={require('../../images/empty/no_task_gray.png')} />
                    <Text style={{fontSize:20, fontWeight:'800', paddingTop: 16, color:'#bdbdbd'}}>
                        您还没有任务
                    </Text>
                </View>
            )
         }
    },
    renderListView: function(){
        if (!this.state.list || this.state.list.length == 0) {
            return this.renderEmptyRow();
        };
                // onRefresh = {this.onRefresh}
                // onInfinite = {this.onInfinite}
                // loadedAllData={this.loadedAllData}
                // scrollEnabled={this.state.scrollEnabled}
                // renderSectionHeader={this.renderSectionHeader}
        return (
            <ListView
                ref = {(list) => {this.list= list}}
                dataSource={this.state.dataSource}
                renderRow={this.renderRow}
                scrollEventThrottle={10}
                contentContainerStyle={{paddingBottom: 40}}
                onEndReached={this.onInfinite}
                onEndReachedThreshold={40}
                scrollEnabled={this.state.scrollEnabled}
                refreshControl={
                          <RefreshControl
                            refreshing={this.state.isRefreshing}
                            onRefresh={this.onRefresh}
                            tintColor="#969696"
                            title=""
                            colors={['#969696', '#969696', '#969696']}
                            progressBackgroundColor="#969696" />
                        }
                >
            </ListView>
            )
    },
    renderLoadingView: function(){
        return (
            <View style={commonStyle.header}>
                <Text style={commonStyle.headerText}>User List</Text>
                <View style={commonStyle.container}>
                    <ActivityIndicatorIOS
                        animating={!this.state.loaded}
                        style={[commonStyle.activityIndicator]}
                        size="small" />
                </View>
            </View>
        );
    }
});