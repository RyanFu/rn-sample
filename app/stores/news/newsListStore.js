'use strict';

var alt = require('../../common/alt');
var newsListAction = require('../../actions/news/newsListAction');
var newsListService = require('../../services/news/newsListService')
var asyncStorage = require('../../common/storage');
var appConstants = require('../../constants/appConstants');
class NewsListStore {
    constructor() {
        this.bindActions(newsListAction);
        this.state = {};
    }

    onGetList(data) {
        newsListService.getList(data)
        .then((responseData) => {
            newsListAction.getListSuccess(responseData)
        }).done();

        this.preventDefault();
    }
    onGetListSuccess(responseData){
        if (!responseData) {return false};
        responseData.type = 'get'
        appConstants.newsList = responseData.data
        asyncStorage.setItem('appConstants', appConstants);
        this.setState(responseData);
    }
    onLoadMore(data) {
        newsListService.getList(data)
        .then((responseData) => {
            newsListAction.loadMoreSuccess(responseData)
        }).done();

        this.preventDefault();
    }
    onLoadMoreSuccess(responseData){
        if (!responseData || !responseData.data) {return false};
        responseData.type = 'loadmore'
        this.mergeList(responseData)
    }
    mergeList(responseData){
        asyncStorage.getItem('appConstants')
        .then((result)=>{
            if (!!result.newsList) {
                responseData.data = result.newsList.concat(responseData.data)
                this.setState(responseData);
            }else{
                this.setState(responseData);
            }
            appConstants.newsList = responseData.data
            asyncStorage.setItem('appConstants', appConstants);
        }).done();
    }
}

export default alt.createStore(NewsListStore, 'NewsListStore');