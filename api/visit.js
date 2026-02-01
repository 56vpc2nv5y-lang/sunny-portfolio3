// 导入依赖 (Vercel 会自动处理 package.json)
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// 初始化 Supabase 客户端 (环境变量需要在 Vercel 后台设置)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  // 1. CORS 设置：允许你的域名访问
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // 上线后建议改为你的具体域名
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 2. 隐私检查：尊重 "Do Not Track"
  if (req.headers['dnt'] === '1') {
    // 即使不追踪，我们也可以返回当前的计数，但不记录这次访问
    const { count } = await supabase.from('website_traffic').select('*', { count: 'exact', head: true });
    return res.status(200).json({ total_visits: count || 0 });
  }

  try {
    // 3. 获取并立即匿名化 IP
    // x-forwarded-for 是标准代理头，x-vercel-ip-country 是 Vercel 提供的地理位置头
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // 生成每日 Salt (你可以每天在环境变量里换，也可以用日期作为 Salt)
    const dateSalt = new Date().toISOString().split('T')[0]; // "2023-10-27"
    
    // 核心隐私逻辑：不可逆 Hash
    // Hash = SHA256(IP + UserAgent + 当天日期 + 只有你知道的Secret)
    // 结果：每天同一个用户的 Hash 一样（用于去重），但无法反推 IP，且隔天失效。
    const rawString = `${ip}-${userAgent}-${dateSalt}-${process.env.HASH_SECRET}`;
    const userHash = crypto.createHash('sha256').update(rawString).digest('hex');

    // 4. 获取地理位置 (利用 Vercel 提供的 Headers，无需自身集成 GeoIP 库)
    const country = req.headers['x-vercel-ip-country'] || 'Unknown';
    const city = req.headers['x-vercel-ip-city'] || 'Unknown';
    const path = req.query.path || '/';

    // 5. 调用数据库存储过程
    const { data, error } = await supabase.rpc('record_visit', {
      user_hash: userHash,
      user_country: country,
      user_city: city,
      page_path: path
    });

    if (error) throw error;

    // 6. 返回结果
    res.status(200).json(data);

  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
