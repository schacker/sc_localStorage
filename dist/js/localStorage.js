var Storage={
//默认属性
propertys:function(){
//代理对象，默认为localstorage
this.sProxy=window.localStorage,
//60 * 60 * 24 * 30 * 1000 ms ==30天
this.defaultLifeTime=2592e6,
//本地缓存用以存放所有localstorage键值与过期日期的映射
this.keyCache="SYSTEM_KEY_TIMEOUT_MAP",
//当缓存容量已满，每次删除的缓存数
this.removeNum=5},assert:function(){if(null===this.sProxy)throw"not override sProxy property"},initialize:function(e){this.propertys(),this.assert()},/* 新增localstorage
    数据格式包括唯一键值，json字符串，过期日期，存入日期
    sign 为格式化后的请求参数，用于同一请求不同参数时候返回新数据，比如列表为北京的城市，后切换为上海，会判断tag不同而更新缓存数据，tag相当于签名
    每一键值只会缓存一条信息
    */
set:function(e,t,i,r){var s=new Date,o=s.getTime(),n=null;i||(s.setTime(s.getTime()+this.defaultLifeTime),i=s.getTime()),
//
this.setKeyCache(e,i),n=this.buildStorageObj(t,o,i,r);try{return this.sProxy.setItem(e,JSON.stringify(n)),!0}catch(s){
//localstorage写满时,全清掉
if("QuotaExceededError"==s.name){
//            this.sProxy.clear();
//localstorage写满时，选择离过期时间最近的数据删除，这样也会有些影响，但是感觉比全清除好些，如果缓存过多，此过程比较耗时，100ms以内
if(!this.removeLastCache())throw"本次数据存储量过大";this.set(e,t,i,r)}console&&console.log(s)}return!1},
//删除过期缓存
removeOverdueCache:function(){var e,t,i=null,r=(new Date).getTime(),s=this.sProxy.getItem(this.keyCache),o=[],n=[];if(s){for(o=JSON.parse(s),e=0,t=o.length;e<t;e++)i=o[e],i.timeout<r?this.sProxy.removeItem(i.key):n.push(i);this.sProxy.setItem(this.keyCache,JSON.stringify(n))}},removeLastCache:function(){var e,t,i=this.removeNum||5,r=this.sProxy.getItem(this.keyCache),s=[],o=[];
//说明本次存储过大
if(!r)return!1;for(s.sort(function(e,t){return e.timeout-t.timeout}),
//删除了哪些数据
o=s.splice(0,i),e=0,t=o.length;e<t;e++)this.sProxy.removeItem(o[e].key);return this.sProxy.setItem(this.keyCache,JSON.stringify(s)),!0},setKeyCache:function(e,t){if(e&&t&&!(t<(new Date).getTime())){var i,r,s,o=this.sProxy.getItem(this.keyCache),n=[],a=!1,h={};for(h.key=e,h.timeout=t,o&&(n=JSON.parse(o),_.isArray(n)||(n=[])),i=0,r=n.length;i<r;i++)if(s=n[i],s.key==e){n[i]=h,a=!0;break}a||n.push(h),
//最后将新数组放到缓存中
this.sProxy.setItem(this.keyCache,JSON.stringify(n))}},buildStorageObj:function(e,t,i,r){var s={value:e,timeout:i,sign:r,indate:t};return s},get:function(e,t){var i,r=(new Date).getTime();try{
//数据过期
//需要验证签名
return(i=this.sProxy.getItem(e))?(i=JSON.parse(i),i.timeout<r?null:t?t===i.sign?i.value:null:i.value):null}catch(e){console&&console.log(e)}return null},
//获取签名
getSign:function(e){var t,i=null;try{t=this.sProxy.getItem(e),t&&(t=JSON.parse(t),i=t&&t.sign)}catch(e){console&&console.log(e)}return i},remove:function(e){return this.sProxy.removeItem(e)},clear:function(){this.sProxy.clear()}};Storage.getInstance=function(){return this.instance?this.instance:this.instance=new this},
// window.Storage = Storage;
module.exports=Storage;