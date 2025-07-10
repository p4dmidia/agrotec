import { db } from "./db";
import { learningTracks, learningVideos, storeProducts } from "@shared/schema";

async function seedDatabase() {
  console.log("Seeding database...");

  // Seed learning tracks
  const trackResults = await db.insert(learningTracks).values([
    {
      title: "Agricultura Básica",
      description: "Fundamentos da agricultura moderna",
      imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%2315803d'/%3E%3Ctext x='200' y='150' font-family='Arial' font-size='16' fill='white' text-anchor='middle' dy='.3em'%3EAgricultura Básica%3C/text%3E%3C/svg%3E",
      videoCount: 12,
      duration: "3h 45min",
      category: "basic",
    },
    {
      title: "Cultivo de Hortaliças",
      description: "Técnicas para cultivo de vegetais",
      imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%2322c55e'/%3E%3Ctext x='200' y='150' font-family='Arial' font-size='16' fill='white' text-anchor='middle' dy='.3em'%3ECultivo de Hortaliças%3C/text%3E%3C/svg%3E",
      videoCount: 8,
      duration: "2h 30min",
      category: "vegetables",
    },
    {
      title: "Pecuária Sustentável",
      description: "Manejo responsável de rebanhos",
      imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23166534'/%3E%3Ctext x='200' y='150' font-family='Arial' font-size='16' fill='white' text-anchor='middle' dy='.3em'%3EPecuária Sustentável%3C/text%3E%3C/svg%3E",
      videoCount: 15,
      duration: "4h 20min",
      category: "livestock",
    },
  ]).returning();

  // Seed learning videos for each track
  for (let i = 0; i < trackResults.length; i++) {
    const track = trackResults[i];
    const videoCount = track.videoCount;
    
    const videos = [];
    for (let j = 1; j <= videoCount; j++) {
      videos.push({
        trackId: track.id,
        title: `Vídeo ${j} - ${track.title}`,
        description: `Conteúdo educativo sobre ${track.title.toLowerCase()}`,
        videoUrl: `https://example.com/video-${track.id}-${j}`,
        duration: `${Math.floor(Math.random() * 20) + 5} min`, // 5-25 minutes as string
        order: j,
      });
    }
    
    await db.insert(learningVideos).values(videos);
  }

  // Seed store products
  await db.insert(storeProducts).values([
    {
      name: "Sementes de Tomate Cereja",
      description: "Sementes orgânicas de tomate cereja, ideais para cultivo doméstico",
      price: "12.50",
      category: "seeds",
      imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23dc2626'/%3E%3Ctext x='200' y='150' font-family='Arial' font-size='16' fill='white' text-anchor='middle' dy='.3em'%3ESementes de Tomate%3C/text%3E%3C/svg%3E",
      inStock: true,
    },
    {
      name: "Fertilizante Orgânico 5kg",
      description: "Adubo natural rico em nutrientes para plantas",
      price: "45.90",
      category: "fertilizers",
      imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23a16207'/%3E%3Ctext x='200' y='150' font-family='Arial' font-size='16' fill='white' text-anchor='middle' dy='.3em'%3EFertilizante Orgânico%3C/text%3E%3C/svg%3E",
      inStock: true,
    },
    {
      name: "Regador Automático",
      description: "Sistema de irrigação por gotejamento para hortas",
      price: "89.99",
      category: "tools",
      imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%2306b6d4'/%3E%3Ctext x='200' y='150' font-family='Arial' font-size='16' fill='white' text-anchor='middle' dy='.3em'%3ERegador Automático%3C/text%3E%3C/svg%3E",
      inStock: true,
    },
    {
      name: "Pesticida Natural",
      description: "Defensivo agrícola orgânico e biodegradável",
      price: "32.50",
      category: "pesticides",
      imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23059669'/%3E%3Ctext x='200' y='150' font-family='Arial' font-size='16' fill='white' text-anchor='middle' dy='.3em'%3EPesticida Natural%3C/text%3E%3C/svg%3E",
      inStock: true,
    },
    {
      name: "Kit Ferramentas de Jardim",
      description: "Conjunto completo com pá, enxada e rastelo",
      price: "125.00",
      category: "tools",
      imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%236b7280'/%3E%3Ctext x='200' y='150' font-family='Arial' font-size='16' fill='white' text-anchor='middle' dy='.3em'%3EKit Ferramentas%3C/text%3E%3C/svg%3E",
      inStock: true,
    },
    {
      name: "Sementes de Alface Americana",
      description: "Sementes híbridas de alface com alta produtividade",
      price: "8.90",
      category: "seeds",
      imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%2316a34a'/%3E%3Ctext x='200' y='150' font-family='Arial' font-size='16' fill='white' text-anchor='middle' dy='.3em'%3ESementes de Alface%3C/text%3E%3C/svg%3E",
      inStock: true,
    },
  ]);

  console.log("Database seeded successfully!");
}

// Run the seed function if this file is executed directly
if (import.meta.url.endsWith(process.argv[1])) {
  seedDatabase()
    .then(() => {
      console.log("Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error seeding database:", error);
      process.exit(1);
    });
}

export { seedDatabase };