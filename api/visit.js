const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  // 1. CORS 设置
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  // 2. 尊重 DNT
  if (req.headers['dnt'] === '1') {
    const { count } = await supabase.from('website_traffic').select('*', { count: 'exact', head: true });
    return res.status(200).json({ total_visits: count || 0 });
  }

  try {
    // 3. 获取基础信息
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // 生成 Hash (用于去重)
    const dateSalt = new Date().toISOString().split('T')[0];
    const rawString = `${ip}-${userAgent}-${dateSalt}-${process.env.HASH_SECRET}`;
    const userHash = crypto.createHash('sha256').update(rawString).digest('hex');

    // Vercel 提供的基础地理位置
    const country = req.headers['x-vercel-ip-country'] || 'Unknown';
    const city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : 'Unknown';
    const path = req.query.path || '/';

    // === 新功能 1: 获取 URL 来源标签 (?ref=xxx) ===
    // 如果 URL 里没有 ref，默认记为 'direct'
    const referrerTag = req.query.ref || 'direct';

    // === 新功能 2: 查询 ISP 和 公司信息 (ip-api.com) ===
    let isp = 'Unknown';
    let org = 'Unknown';

    // 排除本地 IP 和未知 IP，避免浪费 API 调用次数
    if (ip !== 'unknown' && !ip.startsWith('127.0') && !ip.startsWith('::1')) {
      try {
        // 取第一个 IP (防止代理链)
        const targetIp = ip.split(',')[0].trim();
        // 请求 ip-api (非商业用途免费)
        const geoRes = await fetch(`http://ip-api.com/json/${targetIp}?fields=isp,org,mobile`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          isp = geoData.isp || 'Unknown';
          org = geoData.org || 'Unknown';
          if (geoData.mobile) isp += ' (Mobile)';
        }
      } catch (e) {
        console.warn('ISP fetch error:', e.message);
      }
    }

    // 4. 简单的机器人过滤
    const botCities = ['San Jose', 'Council Bluffs', 'Ashburn', 'Dublin'];
    if (botCities.includes(city) || userAgent.toLowerCase().includes('bot')) {
       return res.status(200).json({ total_visits: 0, ignored: true });
    }

    // 5. 写入数据库 (带上 ref, isp, org)
    const { data, error } = await supabase.rpc('record_visit', {
      user_hash: userHash,
      user_country: country,
      user_city: city,
      page_path: path,
      user_isp: isp,           // 传 ISP
      user_org: org,           // 传 公司
      user_referrer: referrerTag // 传 来源标签
    });

    if (error) throw error;

    res.status(200).json(data);

  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
