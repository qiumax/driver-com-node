var config = {
    // page
    page_size: 5,
    
    mongodb: {
        url: "mongodb://sa_driver:wending0304@localhost/driver"
    },
    
    redis: {
        host: 'localhost',
        port: 6379,
        pwd: 'wending0304',
        ttl: 86400
    },
    
    cos: {
        secret_id: "AKIDKVbUCeilRwDF2aAyteS6XnoZ4IGyDdbM",
        secret_key: "jEamjQr3zf5JI9lAKFwNdfaHkyxiEVYM",
        bucket: "driver-1257242347",
        region: "ap-chongqing",
        host: "https://driver-1257242347.cos.ap-chongqing.myqcloud.com"
    },
    
    wx: {
        appid: "wx263a34d37589be43",
        secret: "aed7b9dc3ac8f14f426366a2564c35d1",
        key: 'pYwUbTaaWnTLOpInl2HtnJA7x1v9UVWC',
        mchid: '1518016601',
        notify_url: 'https://driver-com.quxunbao.cn/wx/payNotify'
    },
    
    need: {
        schedule_time: 2*60
    }
}

module.exports = config