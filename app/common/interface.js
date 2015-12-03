'use strict';

var NZAOM_API_DOMAIN = 'http://api.nzaom.com';
var NZAOM_DOMAIN = 'http://www.nzaom.com';
var NZAO_MOBILE_DOMAIN = 'http://m.nzaom.com'
var _debug = true; //上线的时候改成false
if (!!_debug) {
    NZAOM_API_DOMAIN = "http://192.168.1.196";
    // NZAOM_API_DOMAIN = "http://192.168.1.147";

    NZAO_MOBILE_DOMAIN = 'http://192.168.1.147'
        //NZAOM_API_DOMAIN=NZAOM_DOMAIN;
}
module.exports = {
    verifycode: NZAOM_API_DOMAIN + '/api/verifycode',
    user: NZAOM_API_DOMAIN + '/api/user',
    login: NZAOM_API_DOMAIN + '/api/login',
    token: NZAOM_API_DOMAIN + '/api/token',

    contacts: NZAOM_API_DOMAIN + '/api/contacts',

    message: NZAOM_API_DOMAIN + '/api/message',

    invite: NZAOM_API_DOMAIN + '/api/invite'
}