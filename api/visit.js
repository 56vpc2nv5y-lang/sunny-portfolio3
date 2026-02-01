// 文件路径: /api/visit.js
import { createClient } from '@supabase/supabase-js';
// crypto 既然不防刷了，hash 其实随便传个随机数都行，但为了兼容数据库参数，保留它
import crypto from 'crypto'; 

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  // 1. 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  // 2. 🔥 核心：告诉浏览器“永远不要缓存这个接口” 🔥
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { ref = '', path = '/' } = req.query;
    
    // 生成一个随机指纹 (因为不防刷了，这里只要不为空就行)
    const randomHash = crypto.randomBytes(16).toString('hex');

    const country = req.headers['x-vercel-ip-country'] || 'Unknown';
    const city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : 'Unknown';
    
    // 调用刚才改好的 SQL 函数
    const { data, error } = await supabase.rpc('record_visit', {
      user_hash: randomHash, // 传入随机数
      user_country: country,
      user_city: city,
      page_path: path,
      user_isp: 'Unknown',
      user_org: 'Unknown',
      user_referrer: ref 
    });

    if (error) throw error;

    return res.status(200).json({ 
      total_visits: data?.total_visits || 0,
      message: 'Visit recorded (+1)'
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
