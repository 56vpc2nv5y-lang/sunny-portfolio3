import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto'; // 用于生成哈希指纹

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  // 1. 设置跨域头，允许前端访问
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // 2. 从请求中获取各种信息
    const { ref = '', path = '/' } = req.query;
    
    // 获取 IP 和 User Agent 用来生成唯一指纹 (Hash)
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    // 简单的指纹生成逻辑：MD5(IP + UserAgent + 当天日期) -> 每天每个设备只算一次
    const today = new Date().toISOString().split('T')[0];
    const user_hash = crypto.createHash('md5').update(`${ip}-${ua}-${today}`).digest('hex');

    // 3. 从 Vercel 提供的请求头中获取地理位置 (如果有)
    // 注意：City 和 Country 只有在部署到 Vercel 后才会有值，本地运行可能是 undefined
    const country = req.headers['x-vercel-ip-country'] || 'Unknown';
    const city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : 'Unknown';
    
    // 4. ISP 和 Org (运营商信息)
    // Vercel 默认不提供这两个字段，为了不让你的 SQL 报错，我们先给默认值
    // 如果想要真实的 ISP，需要对接 ip-api.com 等额外服务，但会拖慢速度，建议先填 Unknown
    const isp = 'Unknown ISP'; 
    const org = 'Unknown Org';

    // 5. 【关键】调用你在 Supabase 写好的 record_visit 函数 (RPC)
    // 参数名必须和你 SQL 里的定义一模一样！
    const { data, error } = await supabase.rpc('record_visit', {
      user_hash: user_hash,
      user_country: country,
      user_city: city,
      page_path: path,
      user_isp: isp,
      user_org: org,
      user_referrer: ref // 这里传入 ?ref=bytedance 的值
    });

    if (error) {
      console.error('Supabase RPC Error:', error);
      throw error;
    }

    // data 格式应该类似 { "total_visits": 123 }
    return res.status(200).json({ 
      total_visits: data?.total_visits || 0,
      message: 'Visit recorded successfully'
    });

  } catch (error) {
    console.error('API Handler Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
