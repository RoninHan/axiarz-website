-- 插入常用物流公司
INSERT INTO courier_companies (id, name, code, website, phone, sort_order, status, created_at, updated_at)
VALUES
  (gen_random_uuid(), '顺丰速运', 'SF', 'https://www.sf-express.com', '95338', 1, 'active', NOW(), NOW()),
  (gen_random_uuid(), '中通快递', 'ZTO', 'https://www.zto.com', '95311', 2, 'active', NOW(), NOW()),
  (gen_random_uuid(), '圆通速递', 'YTO', 'https://www.yto.net.cn', '95554', 3, 'active', NOW(), NOW()),
  (gen_random_uuid(), '申通快递', 'STO', 'https://www.sto.cn', '95543', 4, 'active', NOW(), NOW()),
  (gen_random_uuid(), '韵达快递', 'YD', 'https://www.yundaex.com', '95546', 5, 'active', NOW(), NOW()),
  (gen_random_uuid(), '百世快递', 'BEST', 'https://www.best-inc.com', '95320', 6, 'active', NOW(), NOW()),
  (gen_random_uuid(), '京东物流', 'JD', 'https://www.jdl.com', '950616', 7, 'active', NOW(), NOW()),
  (gen_random_uuid(), '邮政EMS', 'EMS', 'https://www.ems.com.cn', '11183', 8, 'active', NOW(), NOW()),
  (gen_random_uuid(), '德邦快递', 'DBL', 'https://www.deppon.com', '95353', 9, 'active', NOW(), NOW()),
  (gen_random_uuid(), '极兔速递', 'JTSD', 'https://www.jtexpress.cn', '95085', 10, 'active', NOW(), NOW())
ON CONFLICT DO NOTHING;
