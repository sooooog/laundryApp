//서버를 띄우기 위한 기본 템플릿
const express = require('express');
const app = express();
/*
//.listen(서버를 오픈할 포트번호, function(){서버 오픈시 실행할 코드})
//function(){}은 자바스크립트로 함수를 하나 만들겠다는 의미
app.listen(9090, function() {
    console.log('listening on 9090')
})*/

//body-parser 임포트
const bodyParser= require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))    //app.use()는 미들웨어를 사용하겠다는 의미

//mongoDB 임포트
const MongoClient = require('mongodb').MongoClient;

//ejs 임포트 (ejs : 서버데이터를 HTML에 쉽게 박아넣을 수 있게 도와주는 HTML 렌더링 엔진)
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').__express);
app.set('views', __dirname + '/views');

//로그인(passport), 로그인검증(passport-local), 세션생성(express-session) 임포트
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session()); 

//bcrypt 임포트
const bcrypt = require('bcrypt');
const saltRounds = 10;                              //해킹 방지를 위한 접근 제한 변수

//dotenv(환경변수 사용) 등록
require('dotenv').config()


//mongoDB와 server 통신 코드
//{ useUnifiedTopology: true } : 워닝메세지 제거
var db; //db 전역변수
MongoClient.connect(process.env.DB_URL, { useUnifiedTopology: true }, function(에러, client){
    if (에러) return console.log(에러);
    db = client.db('laundrycheck')    //laundrycheck라는 db에 접속

    //db의 collection에 자료 추가하는 코드
    /*1) 기본 - 하드코딩으로 db에 저장
    //db.collection('post') : collection 중에 post 라는걸 선택
    //insertOne() : 자료 추가 (Object 자료형식으로 추가가능)
    //-> insertOne(추가 할 자료, 콜백함수) 
    db.collection('post').insertOne( {이름 : 'John', _id : 100} , function(에러, 결과){
	    console.log('collection에 저장완료'); 
	});

    // 2) 지정한 경로로 POST(쓰기) 요청을 하여 db에 저장
    app.post('/add', function(req, res){
        res.send('전송완료')

        //DB에 저장하기
        db.collection('post').insertOne( {제목 : req.body.title, 날짜 : req.body.date} , function(에러, 결과){
	        console.log('collection에 저장완료'); 
	    });
    })
    3) db명 접속 + collection 자료 추가
    client.db('db명').collection('collection명').insertOne(추가할 자료, 콜백함수)
    */
    

    //회원가입 시 아이디 중복 검사(추가중..)-------------------------------------
    /*app.post('/signup', function(req, res){
        db.collection('customer').findOne({ id: req.body.userid }, function (에러, 결과) {
            if (에러) return done(에러)

            if(결과.id == req.body.userid ) {
                res.send('중복된 아이디입니다!')
                //res.render('/signup', {중복된유저 : 결과})
            }
            else {
                db.collection('customer').insertOne({name : req.body.username, id : req.body.userid,
                    pw : req.body.userpw1, phone : req.body.userphone},
                    function(에러,결과){
                console.log('회원가입 데이터 저장완료'); 

                res.redirect('/login');
                console.log('회원가입 성공')
            })}
        })
    })
    //-------------------------------------------------------------------------*/

    //회원가입(signup)에서 input한 데이터를 db에 저장하기------------------------    
    app.post('/signup', function(req, res){
        db.collection('customer').insertOne( {name : req.body.username, id : req.body.userid,
            pw : req.body.userpw1, phone : req.body.userphone},
            function(에러, 결과){
        console.log('회원가입 데이터 저장완료'); 
        });

        res.redirect('/login')   //회원가입 성공 시 /login으로 이동
        console.log('회원가입 성공')
    })
    //-------------------------------------------------------------------------


    //db와 연결 성공하면 서버 띄우기(윗 부분 서버띄우는 코드 여기로 옮기기)
    app.listen(process.env.PORT, function(){
      console.log('listening on 9090')
    });
})



/* GET(읽기) 요청을 처리하는 기계 (req : request, 요청  |  res : response, 응답)
1) /pet으로 방문하면.. pet관련 안내문 띄우기
app.get('/pet', function(req, res){
    res.send('펫 용품을 쇼핑할 수 있는 페이지입니다.')
})

2) /pet으로 방문하면.. HTML 파일 보내기
//__dirname은 현재 파일의 경로, .sendFile(보낼파일경로)
app.get('/pet', function(req, res){
    res.sendFile(__dirname + '/pet.html')
})

3) /pet으로 방문하면.. EJS 파일 렌더링하기
app.get('/pet', function(req, res){
    res.render('/pet.ejs')
})
*/
//홈(/) 페이지
app.get('/', function(req, res){
    res.render('home.ejs')
})

//로그인(/login) 페이지
app.get('/login', function(req, res) { 
    res.render('login.ejs')
});

//회원가입(/signup) 페이지
app.get('/signup', function(req, res) { 
    res.render('signup.ejs')
});

//주의사항(/caution) 페이지
app.get('/caution', function(req, res){
    res.render('caution.ejs')
})

//웨이팅 신청성공 페이지
app.get('/waitsuccess', function(req, res){
    res.render('waitsuccess.ejs')
})

//웨이팅 신청실패 페이지
app.get('/waitfail', function(req, res){
    res.render('waitfail.ejs')
})


/* POST(쓰기) 요청을 처리하는 기계
1) /login으로 방문하면.. input한 데이터를 로그에 출력하기
- input한 정보는 req(요청)에 저장되어 있으므로, body-parser로 요청데이터(body) 해석
app.post('/login', function(req, res){
    res.send('전송완료')

    //전송된 데이터를 로그에 출력하기
    console.log(req.body.id)
    console.log(req.body.pw)
}) */

//로그인(login)에서 input한 데이터를 로그에 출력하기-------------------------------
//1. /login에서 POST요청인 로그인을 하면 아이디, 비번 검사
/* 추가설명
passport : 로그인 기능 쉽게 구현 가능
authenticate() : 인증해주는 코드
authenticate('local') : local 방식으로 인증
redirect() : 지정한 경로로 이동
*/
app.post('/login', passport.authenticate('local', {
        failureRedirect : '/loginfail'  //로그인 실패 시 /fail로 이동
        }), function(req, res){

    res.redirect('/')   //로그인 성공 시 /(홈)으로 이동
    console.log('로그인 성공')
})

//2. 아이디, 비번의 인증방법에 대한 세부 코드 작성
/* 추가설명
인증하는 방법을 Strategy라고 칭하며,
local 방식으로 아이디/비번 검사를 어떻게 할지 도와주는 부분
LocalStrategy( { 설정 }, function(){ 아이디비번 검사하는 코드 })

done(서버에러, 성공시사용자db데이터, 에러메세지)
두번째 파라미터에서 아이디/비번 안맞으면 false 넣고, 맞으면 결과*/
passport.use(new LocalStrategy({
    //유저가 입력한 아이디/비번 항목이 무엇인지 정의(name 속성)
    usernameField: 'id',
    passwordField: 'pw',
    session: true,              //세션을 하나 만들어줄건지 여부(재로그인 안해도 됨)
    passReqToCallback: false,   //true로 하면 아이디/비번 말고도 다른 정보 검증 가능
    //콜백함수의 첫번째 파라미터로 기타 정보들이 들어가는데 파라미터.body 이런 식으로 출력
    }, function (입력한아이디, 입력한비번, done) { 

    //db의 customer collection에 입력한 아이디가 있는지 찾기  
    db.collection('customer').findOne({ id: 입력한아이디 }, function (에러, 결과) {
      if (에러) return done(에러)
       
      //db에 아이디가 없으면
      if (!결과) return done(null, false, { message: '존재하지 않는 아이디입니다!' })
      
      //db에 아이디가 있으면, 입력한 비번과 결과.pw 비교
      if (입력한비번 == 결과.pw) {
        return done(null, 결과)     //동일한 결과이므로 '결과'
      } else {
        return done(null, false, { message: '비번이 틀렸습니다!' })  //동일하지 않은 결과이므로 'false'
      }
    })
}));

//3. 세션 생성
/*3-1) 세션을 저장시키는 코드(로그인 성공 시 발동)
  아이디, 비번 검증 성공 시 리턴된 결과를 user로 보냄*/
  passport.serializeUser(function (user, done) {
    done(null, user.id)
});

/*3-2) 세션 데이터를 가진 사람을 DB에서 찾는 코드(웨이팅 페이지 접속 시 발동)
//위의 user.id와 deserializeUser의 아이디는 동일함*/
passport.deserializeUser(function (아이디, done) {
    /*db에서 위의 user.id로 유저를 찾은 뒤 유저 정보를
    done(null, {요기에 넣음})
    -> 요청할 때마다 DB 이름을 웨이팅페이지에서 출력 가능*/

    db.collection('customer').findOne({ id : 아이디 }, function (에러, 결과) {
        done(null, 결과)    //결과는 {id:test,pw:test}
    })
});

//4. 세션있는 사람만 들어가는 웨이팅페이지(EJS와 라우팅)
//미들웨어 사용 - 웨이팅, 웨이팅 신청성공, 웨이팅 확인 페이지 접속할 때마다 '로그인여부()' 실행

//웨이팅 페이지
app.get('/wait', 로그인여부, function (req, res) { 
    console.log(req.user);
    //res.render('wait.ejs', {사용자 : req.user})  //req.user를 사용자라는 이름으로 보냄

    //-------------------------------------------------
    //DB에서 데이터 꺼내기 - DB.counter 내의 대기인원수를 찾음
    db.collection('counter').findOne({name : '대기인원수'}, function(에러, 결과){
        console.log("/wait 대기인원수 : " + 결과.totalWait) //결과.totalWait = 대기인원수
        
        //찾은 데이터를 wait.ejs 안에 넣기
        //req.user를 사용자라는 이름으로, 결과를 counters라는 이름으로 보내기
        res.render('wait.ejs', {사용자 : req.user, counters : 결과})
    });
    //-------------------------------------------------
})

app.post('/wait', 로그인여부, function(req, res){
    //db에서 데이터 꺼내기 - db.counter에서 name이 대기인원수인 데이터 찾기
    db.collection('counter').findOne({name: '대기인원수'}, function(에러, 결과){
        console.log("대기인원수 : " + 결과.totalWait) //결과.totalWait = 대기인원수
        var 총대기인원수 = 결과.totalWait   //총대기인원수라는 변수에 저장

        //db.waitinfo에 로그인한 유저의 id를 찾아서..
        db.collection('waitinfo').findOne({userid : req.user.id}, function(에러, 결과){
            if(에러) return done(에러)

            //id가 존재하지 않다면.. 웨이팅 신청 가능으로 db에.waitinfo에 저장
            if(!결과){
                //db 저장 - 웨이팅 신청 가능으로 db에.waitinfo에 저장 (_id : 총대기인원수+1로 새로운 데이터를 저장)
                db.collection('waitinfo').insertOne( {_id : 총대기인원수 + 1, myNumber : 총대기인원수 + 1,
                        userid : req.user.id, wmac : 0, isUseWait : false} , function(에러, 결과){
                    console.log('대기인원 데이터 저장완료');
                
                    //db 수정 - db.counter 내의 totalWait이라는 항목도 +1 증가(총대기인원수+1)
                    //operator 종류 : $set(변경), $inc(증가), $min(기존값보다 적을 때만 변경), $rename(key값 이름변경)
                    db.collection('counter').updateOne({name: '대기인원수'}, {$inc: {totalWait:1} }, function(에러, 결과){
                        if(에러){return console.log(에러)}
                    })
                }) 
                res.redirect('/waitsuccess')
                console.log('웨이팅 신청성공');
            }
            else{
                res.redirect('/waitfail')
                console.log('웨이팅 신청실패');
            } 
        })    
    });  
})

//웨이팅 확인 페이지
app.get('/waitcheck', 로그인여부, function (req, res) { 
    console.log(req.user); 
    //res.render('waitcheck.ejs', {사용자 : req.user})  //req.user를 사용자라는 이름으로 보냄

    //--------------------------------------------------
    //db.waitinfo에 로그인한 유저의 id를 찾고
    db.collection('waitinfo').findOne({userid : req.user.id}, function(에러, 결과1){
        console.log("/waitcheck 본인웨이팅번호 : " + 결과1.myNumber)

        //db.counter에서 name이 대기인원수인 데이터 찾기
        db.collection('counter').findOne({name: '대기인원수'}, function(에러, 결과2){

            console.log("/waitcheck 대기인원수 : " + 결과2.totalWait)
            console.log("/waitcheck 앞에남은인원수 : " + (결과2.totalWait) -1)

        })
        
        //찾은 데이터를 waitcheck.ejs 안에 넣기
        //req.user를 사용자라는 이름으로, 결과를 본인웨이팅번호라는 이름으로 보내기
        res.render('waitcheck.ejs', {사용자 : req.user, 본인웨이팅번호 : 결과1})
    });

    /*//DB에서 데이터 꺼내기 - DB.waitinfo 내의 유저의 아이디를 찾음
    db.collection('waitinfo').findOne({userid : req.user.id}, function(에러, 결과){
        console.log("/waitcheck 본인웨이팅번호 : " + 결과.myNumber)

        //DB에서 데이터 꺼내기 - DB.counter 내의 대기인원수를 찾음
        db.collection('counter').findOne({name: '대기인원수'}, function(에러, 결과) {
        //var 현재본인웨이팅번호 = (결과.tatalWait) - 1;

        console.log("/waitcheck 현재본인웨이팅번호 : " + (결과.tatalWait) - 1)

        //찾은 데이터를 waitcheck.ejs 안에 넣기
        //req.user를 사용자라는 이름으로, 결과를 본인웨이팅번호라는 이름으로 보내기
        res.render('waitcheck.ejs', {사용자 : req.user, waitinfo : 결과, 현재본인웨이팅번호 : (결과.tatalWait) - 1})
        });
    });*/

    
    //--------------------------------------------------
}) 

//미들웨어 생성
//웨이팅페이지 접속 전 실행할 미들웨어 - 로그인 여부 구분(로그인 후 세션이 있다면, 요청.user가 항상 있음)
function 로그인여부(req, res, next){
    if(req.user) {      //요청.user가 있는지 검사
        next()           //있다면 다음으로 통과
    }
    else {               //없다면 '로그인 안되었어요!' 출력
        res.send('로그인이 안 되었어요!')
    }
}


