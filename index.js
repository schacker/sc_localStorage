(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) : (global.Storage = factory());
})(this, function(){
	function Storage() {
		this.initialize.call(this);
	}
	//默认属性
	Storage.prototype = {
		constructor: Storage,
		propertys: function () {
			//代理对象，默认为localstorage
			this.sProxy = window.localStorage;
			//60 * 60 * 24 * 30 * 1000 ms ==30天
			this.defaultLifeTime = 2592000000;
			//本地缓存用以存放所有localstorage键值与过期日期的映射
			this.keyCache = 'SYSTEM_KEY_TIMEOUT_MAP';
			//当缓存容量已满，每次删除的缓存数
			this.removeNum = 5;
		},
		assert: function () {
			if (this.sProxy === null) {
				throw 'not override sProxy property';
			}
		},
		initialize: function (opts) {
			this.propertys();
			this.assert();
		},
		/* 新增localstorage
		数据格式包括唯一键值，json字符串，过期日期，存入日期
		sign 为格式化后的请求参数，用于同一请求不同参数时候返回新数据，比如列表为北京的城市，后切换为上海，会判断tag不同而更新缓存数据，tag相当于签名
		每一键值只会缓存一条信息
		*/
		/**
		 * 设置本地缓存
		 * @param {[String]} key     [key值]
		 * @param {[Object|String]} value   [value值]
		 * @param {[String]} timeout [超时时间]
		 * @param {[String]} sign    [签名校验]
		 */
		set: function (key, value, timeout, sign) {
			var _d = new Date();
			//存入日期
			var indate = _d.getTime();
			this.removeOverdueCache();
			//最终保存的数据
			var entity = null;
			if (!timeout) {
				_d.setTime(_d.getTime() + this.defaultLifeTime);
				timeout = _d.getTime();
			} else {
				timeout = _d.getTime() + timeout;
			}
			this.setKeyCache(key, timeout);
			entity = this.buildStorageObj(value, indate, timeout, sign);

			try {
				this.sProxy.setItem(key, JSON.stringify(entity));
				return true;
			} catch (e) {
				//localstorage写满时,全清掉
				if (e.name == 'QuotaExceededError') {
				//            this.sProxy.clear();
				//localstorage写满时，选择离过期时间最近的数据删除，这样也会有些影响，但是感觉比全清除好些，如果缓存过多，此过程比较耗时，100ms以内
				if (!this.removeLastCache()) throw '本次数据存储量过大';
				this.set(key, value, timeout, sign);
				}
				console && console.log(e);
			}
			return false;
		},
		//删除过期缓存
		removeOverdueCache: function () {
			var tmpObj = null, i, len;
			var now = new Date().getTime();
			//取出键值对
			var cacheStr = this.sProxy.getItem(this.keyCache);
			var cacheMap = [];
			var newMap = [];
			if (!cacheStr) {
				return;
			}
			cacheMap = JSON.parse(cacheStr);
			for (i = 0, len = cacheMap.length; i < len; i++) {
				tmpObj = cacheMap[i] || {};
				if (tmpObj.timeout < now) {
					this.sProxy.removeItem(tmpObj.key);
				} else {
					newMap.push(tmpObj);
				}
			}
			this.sProxy.setItem(this.keyCache, JSON.stringify(newMap));
		},
		removeLastCache: function () {
			var i, len;
			var num = this.removeNum || 5;
			//取出键值对
			var cacheStr = this.sProxy.getItem(this.keyCache);
			var cacheMap = [];
			var delMap = [];

			//说明本次存储过大
			if (!cacheStr) return false;

			cacheMap.sort(function (a, b) {
				return a.indate - b.indate;
			});

			//删除了哪些数据
			delMap = cacheMap.splice(0, num);
			for (i = 0, len = delMap.length; i < len; i++) {
				this.sProxy.removeItem(delMap[i].key);
			}
			this.sProxy.setItem(this.keyCache, JSON.stringify(cacheMap));
			return true;
		},

		setKeyCache: function (key, timeout) {
			if (!key || !timeout || timeout < new Date().getTime())
				return;
			var i, len, tmpObj;

			//获取当前已经缓存的键值字符串
			var oldstr = this.sProxy.getItem(this.keyCache);
			var oldMap = [];
			//当前key是否已经存在
			var flag = false;
			var obj = {};
			obj.key = key;
			obj.timeout = timeout;

			if (oldstr) {
				oldMap = JSON.parse(oldstr);
				if (Object.prototype.toString.call(oldMap) !== '[object Array]') {
					oldMap = [];
				}
			}
			for (i = 0, len = oldMap.length; i < len; i++) {
				tmpObj = oldMap[i];
				if (tmpObj.key == key) {
					oldMap[i] = obj;
					flag = true;
					break;
				}
			}
			if (!flag) oldMap.push(obj);
			//最后将新数组放到缓存中
			this.sProxy.setItem(this.keyCache, JSON.stringify(oldMap));
		},

		buildStorageObj: function (value, indate, timeout, sign) {
			var obj = {
				value: value,
				timeout: timeout,
				sign: sign,
				indate: indate
			};
			return obj;
		},

		get: function (key, sign) {
			var result, now = new Date().getTime();
			this.removeOverdueCache();
			try {
				result = this.sProxy.getItem(key);
				if (!result) {
					return null
				};
				result = JSON.parse(result);

				//数据过期
				if (result.timeout < now) {
					return null
				};

				//需要验证签名
				if (sign) {
					if (sign === result.sign) {
						return result.value;
					}
					return null;
				} else {
					return result.value;
				}
			} catch (e) {
				console && console.log(e);
			}
			return null;
		},

		//获取签名
		getSign: function (key) {
			var result, sign = null;
			try {
				result = this.sProxy.getItem(key);
				if (result) {
					result = JSON.parse(result);
					sign = result && result.sign
				}
			} catch (e) {
				console && console.log(e);
			}
			return sign;
		},

		remove: function (key) {
			return this.sProxy.removeItem(key);
		},

		clear: function () {
			this.sProxy.clear();
		}
	};
	return Storage
})
