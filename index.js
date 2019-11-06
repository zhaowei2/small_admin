
var express = require('express'),
    fs = require('fs'),
    multer = require('multer'),
    app = express();
const formidable = require('formidable');
const path = require('path')

var storage = multer.memoryStorage()
var upload = multer({ storage: storage })
// app.use(multer({ storage: storage }))  //注意这里的array的参数就是前台控件的name

app.post('/upData',(req,res)=>{
  console.log(req.files) 
  var result = req.files;
  res.end();//返回信息自己定义
})

const token ={
  token:'',
  expires_in:'',
}

const bodyParser = require('body-parser')
const request = require('request');

app.set('view engine', 'pug')
app.use(express.static('public'))
app.set('views','views')
// // parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// // parse application/json
app.use(bodyParser.json());
let baseurl='cloud://qianbianmojing-nh8po.7169-qianbianmojing-nh8po/joke-images/';
// // respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.render('index');
})
// 上传笑话
app.post('/uploadJoke',function(req,res){
  let body = req.body;
  console.log(body.joke)
  if(!body.joke){
    console('joke 为空')
    return false;
  }
  var createTime =new Date().getTime()
  if(verifyTokenExpies()){
    console.log(token.token)
    request({
      url: 'https://api.weixin.qq.com/tcb/databaseadd?access_token='+token.token,//请求路径
      method: "POST",//请求方式，默认为get
      headers: {//设置请求头
          "content-type": "application/json",
      },
      body:JSON.stringify({
        env:'qianbianmojing-nh8po',
        query: "db.collection('joke_tbl').add({data: {text: '"+body.joke+"',createTime:'"+createTime+"',filePath: '',avatar: '',nickName: '',type: 'text',praise: 0,peak: 0,discuss: 0}})",

      }),
    }, function(error, response, body) {
        if(body){
          res.render('index');
        }
    }) 
    // });
  }else{
      getToken();
      request({
        url: 'https://api.weixin.qq.com/tcb/databaseadd?access_token='+token.token,//请求路径
        method: "POST",//请求方式，默认为get
        headers: {//设置请求头
            "content-type": "application/json",
        },
        body:JSON.stringify({
          env:'qianbianmojing-nh8po',
          query: "db.collection('joke_tbl').add({data: {text: '"+body.joke+"',createTime:'"+createTime+"',filePath: '',avatar: '',nickName: '',type: 'text',praise: 0,peak: 0,discuss: 0}})",
        }),
      }, function(error, response, body) {
          if(body){
            res.render('index');
          }
      }) 
    
  }
})
//上传图片至数据库
function updateDbImgList(_id,imgsrc,type,name){
  let createTime = new Date().getTime();
  request({
    url: 'https://api.weixin.qq.com/tcb/databaseadd?access_token='+token.token,//请求路径
    method: "POST",//请求方式，默认为get
    headers: {//设置请求头
        "content-type": "application/json",
    },
    body:JSON.stringify({
      env:'qianbianmojing-nh8po',
      query: "db.collection('img_list').add({data: {title: '',createTime:'"+createTime+"',imgid: '"+_id+"',previewsrc:'"+baseurl+imgsrc+"',nickName: '"+name+"',type: '"+type+"',praise: 0,peak: 0,discuss: 0}})",

    }),
  }, function(error, response, body) {
      if(body){
        console.log('update img sussess');
      }
  }) 

}

//上传图片至数据库预览
function updateDbPreview(_id,imgsrc,type,name){
  let createTime = new Date().getTime();
  request({
    url: 'https://api.weixin.qq.com/tcb/databaseadd?access_token='+token.token,//请求路径
    method: "POST",//请求方式，默认为get
    headers: {//设置请求头
        "content-type": "application/json",
    },
    body:JSON.stringify({
      env:'qianbianmojing-nh8po',
      query: "db.collection('img_preview').add({data: {title: '',createTime:'"+createTime+"',imgid: '"+_id+"',previewsrc:'"+baseurl+imgsrc+"',nickName: '"+name+"',type: '"+type+"',praise: 0,peak: 0,discuss: 0}})",

    }),
  }, function(error, response, body) {
      if(body){
        console.log('update img sussess');
      }
  }) 

}
// 上传图片
app.post('/uploadImage',upload.array('isUpdata'),function(req,res){
    console.log(req.files)
    console.log(req.body.type)
    console.log(req.body.sname)
    let _type = req.body.type;
    let _name = req.body.sname;
    if(verifyTokenExpies()||getToken()){//koken是否过期

      var files = req.files;
      let _id = new Date().getTime();
      files.forEach(function(item,index){
        let getTime = new Date().getTime();
        let filename = item.originalname;
        let nameArray = filename.split('.');
        let type = nameArray[nameArray.length - 1];
        request({
          url: ' https://api.weixin.qq.com/tcb/uploadfile?access_token='+token.token,//请求路径
          method: "POST",//请求方式，默认为get
          headers: {//设置请求头
              "content-type": "application/json",
          },
          body:JSON.stringify({
            env:'qianbianmojing-nh8po',
            path: "joke-images/"+getTime+'.'+type
          }),
        },function(error, response, data){
          var listData = JSON.parse(data);
          console.log(listData);
          if(listData){
            const formData = {
              "key":"joke-images/"+getTime+'.'+type,
              "Signature":listData.authorization,
              "x-cos-security-token":listData.token,
              "x-cos-meta-fileid":listData.cos_file_id,
              "file":{
                value:item.buffer,
                options: {
                  filename: getTime+'.'+type,
                  contentType:type
                }
              },
            }
            
            request({
              url: listData.url,//请求路径
              method: "POST",//请求方式，默认为get
              headers : { 'content-type' : 'multipart/form-data' },
              formData:formData
              // 
            }, function(err, response, body) {
                if (err) {
                  return console.error('upload failed:', err);
                }
                if(index==0){
                  updateDbPreview(_id,getTime+'.'+type,_type,_name)
                }
                updateDbImgList(_id,getTime+'.'+type,_type,_name)
                if(index==files.length-1){
                  res.render('index');
                }
                console.log('Upload successful!  Server responded with:', body);
            }) 
          }
        })
      })
  }
})

app.listen(3000,function(){
  console.log('listen 3000');
   // 获取小程序token
   getToken()
})
// 验证token是否过期
function verifyTokenExpies(){
    if((!token.token)&&((new Date().getTime()+200<token.expires_in))){
        return false
    }else{
      return true
    }
}
function getToken(){
    request({
      url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxc479c1a5105d4b82&secret=12e27c83b7251b2a5f4dd4ff4cbefa56',//请求路径
      method: "GET",//请求方式，默认为get
      headers: {//设置请求头
          "content-type": "application/json",
      },
    }, function(error, response, body) {
        if(body){
          var now = new Date().getTime();+7200*1000
          let pasBody = JSON.parse(body)
          token.token= pasBody.access_token;
          token.expires_in = now
          console.log('getToken')
          console.log(token)
        }
  })  
}