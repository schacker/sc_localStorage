# sc_localStorage
封装localStorage基本操作，设置过期时间，设置对应key的签名sign，获取该key的value必须用之前设置的sign获取
# 使用
npm install sc_localstorage
代码中如何使用

	let a = new Storage()
	
	console.log(a.set('k', '2', 20000, 'signcode'))
	console.log(a.get('k', 'signcode'))

# API
## 1、set(key, value, timeout, sign)
	key: 需要存储的值对应的key
	value: 对应key的值
	timeout: 该key对应值的过期时间(单位/ms)
	sign: 存储该key的值唯一签名弱凭证
## 2、get(key, sign)
	key: 需要获取的值对应的key
	sign: 获取该key的值唯一签名弱凭证