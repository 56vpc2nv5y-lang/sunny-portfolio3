const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  // CORS 设置
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Hash 去重
    const dateSalt = new Date().toISOString().split('T')[0];
    const rawString = `${ip}-${userAgent}-${dateSalt}-${process.env.HASH_SECRET}`;
    const userHash = crypto.createHash('sha256').update(rawString).digest('hex');

    // 地理位置
    const country = req.headers['x-vercel-ip-country'] || 'Unknown';
    const city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : 'Unknown';
    const path = req.query.path || '/';

    // ✅ 获取来源标签
    const referrerTag = req.query.ref || 'direct';

    // ✅ ISP 查询
    let isp = 'Unknown';
    let org = 'Unknown';
    if (ip !== 'unknown' && !ip.startsWith('127.0')) {
      try {
        const targetIp = ip.split(',')[0].trim();
        const geoRes = await fetch(`http://ip-api.com/json/${targetIp}?fields=isp,org,mobile`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          isp = geoData.isp || 'Unknown';
          org = geoData.org || 'Unknown';
          if (geoData.mobile) isp += ' (Mobile)';
        }
      } catch (e) { console.log(e); }
    }

    // ✅ 调用 7 参数函数
    const { data, error } = await supabase.rpc('record_visit', {
      user_hash: userHash,
      user_country: country,
      user_city: city,
      page_path: path,
      user_isp: isp,
      user_org: org,
      user_referrer: referrerTag
    });

    if (error) throw error;
    res.status(200).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
