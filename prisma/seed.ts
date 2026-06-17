import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@minimall.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@minimall.com",
      password: adminPassword,
      role: "admin",
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // Create test user
  const userPassword = await hash("user123", 12);
  const user = await prisma.user.upsert({
    where: { email: "user@test.com" },
    update: {},
    create: {
      name: "Test User",
      email: "user@test.com",
      password: userPassword,
      role: "user",
    },
  });
  console.log(`✅ Test user created: ${user.email}`);

  // Create categories
  const categories = [
    { name: "电子产品", slug: "electronics" },
    { name: "服装鞋帽", slug: "clothing" },
    { name: "食品饮料", slug: "food-drinks" },
    { name: "家居生活", slug: "home-living" },
    { name: "图书文具", slug: "books-stationery" },
  ];

  const createdCategories = [];
  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories.push(category);
  }
  console.log(`✅ ${createdCategories.length} categories created`);

  // Create products
  const products = [
    {
      name: "无线蓝牙耳机",
      slug: "wireless-bluetooth-earphones",
      description:
        "高品质无线蓝牙耳机，支持主动降噪，续航长达30小时，舒适佩戴适合运动与日常使用。",
      price: 299.0,
      imageUrl: "https://picsum.photos/seed/earphones/400/400",
      stock: 100,
      categoryId: createdCategories[0].id,
    },
    {
      name: "智能手表 Pro",
      slug: "smart-watch-pro",
      description:
        "全新智能手表，支持心率监测、血氧检测、GPS运动追踪，IP68防水，续航14天。",
      price: 899.0,
      imageUrl: "https://picsum.photos/seed/watch/400/400",
      stock: 50,
      categoryId: createdCategories[0].id,
    },
    {
      name: "便携式充电宝 20000mAh",
      slug: "power-bank-20000mah",
      description:
        "大容量便携充电宝，支持65W快充，双USB-C输出，可带上飞机。",
      price: 159.0,
      imageUrl: "https://picsum.photos/seed/powerbank/400/400",
      stock: 200,
      categoryId: createdCategories[0].id,
    },
    {
      name: "纯棉T恤 男士",
      slug: "cotton-t-shirt-men",
      description: "100%纯棉面料，柔软透气，经典圆领设计，黑白灰多色可选。",
      price: 79.0,
      imageUrl: "https://picsum.photos/seed/tshirt/400/400",
      stock: 300,
      categoryId: createdCategories[1].id,
    },
    {
      name: "简约运动鞋",
      slug: "simple-sneakers",
      description:
        "轻便舒适运动鞋，网面透气鞋面，EVA缓震鞋底，适合日常穿搭和轻度运动。",
      price: 259.0,
      imageUrl: "https://picsum.photos/seed/sneakers/400/400",
      stock: 150,
      categoryId: createdCategories[1].id,
    },
    {
      name: "羊毛围巾 冬季款",
      slug: "wool-scarf-winter",
      description: "优质羊毛材质，柔软保暖，简约格纹设计，多色可选。",
      price: 129.0,
      imageUrl: "https://picsum.photos/seed/scarf/400/400",
      stock: 80,
      categoryId: createdCategories[1].id,
    },
    {
      name: "有机绿茶 250g",
      slug: "organic-green-tea",
      description: "高山有机绿茶，清香回甘，独立小包装，方便冲泡。",
      price: 68.0,
      imageUrl: "https://picsum.photos/seed/tea/400/400",
      stock: 500,
      categoryId: createdCategories[2].id,
    },
    {
      name: "进口咖啡豆 深度烘焙",
      slug: "imported-coffee-beans",
      description: "哥伦比亚进口咖啡豆，深度烘焙，醇厚浓郁，适合意式咖啡机。",
      price: 88.0,
      imageUrl: "https://picsum.photos/seed/coffee/400/400",
      stock: 200,
      categoryId: createdCategories[2].id,
    },
    {
      name: "手工饼干礼盒",
      slug: "handmade-cookie-gift-box",
      description: "手工制作曲奇饼干礼盒，内含6种口味，精美包装，送礼自用皆宜。",
      price: 108.0,
      imageUrl: "https://picsum.photos/seed/cookies/400/400",
      stock: 100,
      categoryId: createdCategories[2].id,
    },
    {
      name: "香薰蜡烛 薰衣草",
      slug: "lavender-candle",
      description:
        "天然大豆蜡香薰蜡烛，薰衣草精油香气，舒缓助眠，燃烧时间约40小时。",
      price: 49.0,
      imageUrl: "https://picsum.photos/seed/candle/400/400",
      stock: 120,
      categoryId: createdCategories[3].id,
    },
    {
      name: "ins风台灯",
      slug: "ins-style-desk-lamp",
      description: "简约设计台灯，三档调光，USB充电，护眼LED光源。",
      price: 89.0,
      imageUrl: "https://picsum.photos/seed/lamp/400/400",
      stock: 60,
      categoryId: createdCategories[3].id,
    },
    {
      name: "编程入门：JavaScript 基础",
      slug: "javascript-basics-book",
      description:
        "零基础学习JavaScript编程，图文并茂，配有练习题和项目实战，适合编程初学者。",
      price: 45.0,
      imageUrl: "https://picsum.photos/seed/jsbook/400/400",
      stock: 300,
      categoryId: createdCategories[4].id,
    },
    {
      name: "简约笔记本套装",
      slug: "simple-notebook-set",
      description:
        "A5大小笔记本套装，含3本不同内页款式，牛皮纸封面，适合手帐和笔记。",
      price: 35.0,
      imageUrl: "https://picsum.photos/seed/notebook/400/400",
      stock: 400,
      categoryId: createdCategories[4].id,
    },
    {
      name: "4K 网络摄像头",
      slug: "4k-webcam",
      description:
        "超高清4K网络摄像头，自动对焦，内置降噪麦克风，即插即用，适合远程会议和直播。",
      price: 399.0,
      imageUrl: "https://picsum.photos/seed/webcam/400/400",
      stock: 75,
      categoryId: createdCategories[0].id,
    },
    {
      name: "帆布双肩包",
      slug: "canvas-backpack",
      description:
        "复古帆布双肩包，大容量设计，加厚肩带，防泼水处理，适合通勤和短途旅行。",
      price: 169.0,
      imageUrl: "https://picsum.photos/seed/backpack/400/400",
      stock: 90,
      categoryId: createdCategories[1].id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }
  console.log(`✅ ${products.length} products created`);

  console.log("🎉 Seeding completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
