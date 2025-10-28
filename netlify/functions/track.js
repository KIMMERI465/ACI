const axios = require('axios');

const USER_ID = "GDWINE";
const API_KEY = "110D46C918EB492F12B52F958F752ED1";

exports.handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // OPTIONS 요청 처리 (CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { blno } = event.queryStringParameters;
    
    if (!blno) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '운송장번호가 필요합니다' })
      };
    }

    console.log('🚚 배송조회 요청:', blno);
    
    // 1. 토큰 발급
    const tokenResponse = await axios.get('https://acieshop.com/api/kr/token/', {
      headers: {
        'Content-Type': 'application/json',
        'USERID': USER_ID,
        'APIKEY': API_KEY
      }
    });

    if (tokenResponse.data.Status !== "success") {
      throw new Error('토큰 발급 실패: ' + tokenResponse.data.ErrMsg);
    }

    const token = tokenResponse.data.ACIKey;
    console.log('✅ 토큰 발급 성공');

    // 2. 배송 조회
    const trackResponse = await axios.post('https://acieshop.com/api/kr/pod/v1.5/', 
      { BLNO: [blno] },
      {
        headers: {
          'Content-Type': 'application/json',
          'UserID': USER_ID,
          'ACIKey': token
        }
      }
    );

    console.log('📦 조회 결과:', trackResponse.data.Status);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(trackResponse.data)
    };
    
  } catch (error) {
    console.error('❌ 에러:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: '조회 실패', 
        detail: error.message 
      })
    };
  }
};