'use strict';
var React = require('react-native')
var RefreshInfiniteListView = require('react-native-refresh-infinite-listview');
var TimerMixin = require('react-timer-mixin');
var {
    Text,
    View,
    ListView,
    TouchableOpacity,
    ActivityIndicatorIOS,
    StyleSheet
} = React

var workbenchListAction = require('../../actions/workbench/workbenchListAction');
var workbenchListStore = require('../../stores/workbench/workbenchListStore');
var taskListStore = require('../../stores/task/taskListStore');
var taskListAction = require('../../actions/task/taskListAction');
var taskStore = require('../../stores/task/taskStore');

var styles = require('../../styles/home/style.js');
var commonStyle = require('../../styles/commonStyle');
var util = require('../../common/util');
var HomeTaskItem = require('./homeTaskItem');

module.exports = React.createClass({
    mixins: [TimerMixin],
    getInitialState: function() {
        var ds = new ListView.DataSource({
            getSectionData: this.getSectionData,
            getRowData: this.getRowData,
            // rowHasChanged: (r1, r2) => r1 !== r2,
            rowHasChanged: (r1, r2) => true,//为了在swipe的时候刷新列表
            sectionHeaderHasChanged: (s1, s2) => s1 !== s2}) // assumes immutable objects
            // return {dataSource: ds.cloneWithRows(ArticleStore.all())}
        return {
            status: this.props.status,
            pageNum: 1,
            pageSize: 20,
            loaded : false,
            list: [],
            dataSource: ds,
            scrollEnabled: true
        }
    },
    _allowScroll: function(scrollEnabled) {
       this.setState({ scrollEnabled: scrollEnabled })
    },
    _handleSwipeout: function(rowData, sectionID, rowID){
        var rawData = this.state.list;
        if (!rawData) { rawData = [];};
        var dataBlob = {};
        var sectionIDs = [];
        var rowIDs = [];
        for (var i = 0; i <= rawData.length-1; i++) {
            sectionIDs.push(i);
            dataBlob[i] = rawData[i];
            rowIDs[i] = [];
            var subChildren = rawData[i].data;
            for (var j = 0; j <= subChildren.length - 1; j++) {
                var sub = subChildren[j];
                rowIDs[i].push(sub.id);

                if (rowData.id != sub.id) {
                    sub.active = false
                }else{
                    sub.active = true
                }
                dataBlob[i + ':' + sub.id] = sub;
            };
        };
        this.setState({
            dataSource : this.state.dataSource.cloneWithRowsAndSections(dataBlob, sectionIDs, rowIDs)
        });
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
        this.unlisten = workbenchListStore.listen(this.onChange);
        this.unlistenTaskChange = taskStore.listen(this.onTaskChange)
        this.unlistenTaskListChange = taskStore.listen(this.onTaskListChange)
    },
    componentWillUnmount: function() {
        this.unlisten();
        this.unlistenTaskChange();
    },
    transfromDataBlob: function(response){
        var rawData = response.data
        if (!rawData) { rawData = [];};
        var dataBlob = {};
        var sectionIDs = [];
        var rowIDs = [];
        for (var i = 0; i <= rawData.length-1; i++) {
            sectionIDs.push(i);
            dataBlob[i] = rawData[i];
            rowIDs[i] = [];
            var subChildren = rawData[i].data;
            for (var j = 0; j <= subChildren.length - 1; j++) {
                var sub = subChildren[j];
                rowIDs[i].push(sub.id);

                dataBlob[i + ':' + sub.id] = sub;
            };
        };
        this.setState({
            dataSource : this.state.dataSource.cloneWithRowsAndSections(dataBlob, sectionIDs, rowIDs),
            loaded     : true,
            list: rawData || [],
            total: response.total
        });
    },
    getSectionData: function(dataBlob, sectionID){
        return dataBlob[sectionID];
    },
    getRowData: function(dataBlob, sectionID, rowID){
        return dataBlob[sectionID + ':' + rowID];
    },
    renderRow: function(rowData, sectionID, rowID) {
        return (
            <HomeTaskItem rowData={rowData} sectionID={sectionID}
            rowID={rowID}
            _allowScroll={this._allowScroll}
            _handleSwipeout={this._handleSwipeout}
            onPressRow={this.props.onPressRow} />
            )
    },
    renderSectionHeader: function(sectionData, sectionID){
        return(
            <View style={[styles.sectionHeder]}>
                <Text style={[styles.sectionText,commonStyle.blue]}
                numberOfLines={1} >
                    {sectionData.time}
                </Text>
            </View>
            )
    },
    onTaskListChange: function(){
        var result = taskStore.getState();
        if (result.status != 200 && !!result.message) {
            return;
        }
        if (result.type == 'delete') {
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
        this.transfromDataBlob(result);
        !isLoadmore && this.list.hideHeader();
        !!isLoadmore && this.list.hideFooter();
    },
    onChange: function() {
        var result = workbenchListStore.getState();
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
            pageNum: 1
        });
        workbenchListAction.getList({
            status: this.state.status,
            pageNum: this.state.pageNum,
            pageSize: this.state.pageSize
        });
    },
    onInfinite: function() {
        this.setState({
            pageNum: this.state.pageNum + 1
        });
        workbenchListAction.loadMore({
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
    renderListView: function(){
        return (
            <RefreshInfiniteListView
                ref = {(list) => {this.list= list}}
                dataSource={this.state.dataSource}
                renderRow={this.renderRow}
                renderSectionHeader={this.renderSectionHeader}
                scrollEventThrottle={10}
                contentContainerStyle={{paddingBottom: 40}}
                onRefresh = {this.onRefresh}
                onInfinite = {this.onInfinite}
                loadedAllData={this.loadedAllData}
                scrollEnabled={this.state.scrollEnabled}
                >
            </RefreshInfiniteListView>
            )
    },
    renderLoadingView: function(){
        return (
            <View style={commonStyle.header}>
                <Text style={commonStyle.headerText}>User List</Text>
                <View style={commonStyle.container}>
                    <ActivityIndicatorIOS
                        animating={!this.state.loaded}
                        style={[commonStyle.activityIndicator, {height: 80}]}
                        size="large" />
                </View>
            </View>
        );
    }
});