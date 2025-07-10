// Configuração das trilhas de aprendizado
// Para usar vídeos do Google Drive, siga estes passos:
// 1. Abra o arquivo no Google Drive
// 2. Clique em "Compartilhar" e defina permissões para "Qualquer pessoa com o link"
// 3. Copie o ID do arquivo (a parte entre /d/ e /view no URL)
// 4. Use o formato: https://drive.google.com/file/d/{ID_DO_ARQUIVO}/preview

export interface LearningTrackConfig {
  title: string;
  description: string;
  imageUrl: string;
  videoCount: number;
  duration: string;
  category: string;
  videos: VideoConfig[];
}

export interface VideoConfig {
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  order: number;
  practicalTask?: PracticalTaskConfig;
}

export interface PracticalTaskConfig {
  title: string;
  description: string;
  actionType: "immediate" | "weekly" | "seasonal";
  difficulty: "easy" | "medium" | "hard";
  estimatedTime: string;
  materials?: string[];
}

export interface SealConfig {
  title: string;
  description: string;
  iconUrl: string;
  sealType: string;
}

export interface ChecklistConfig {
  title: string;
  description: string;
  items: string[];
}

export const learningTracksConfig: LearningTrackConfig[] = [
  {
    title: "MÓDULO 1 – Introdução à Bananicultura",
    description:
      "Curso introdutório sobre bananicultura: entendendo o negócio, fatores essenciais e planejamento inicial",
    imageUrl:
      "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&h=300&fit=crop",
    videoCount: 3,
    duration: "30min",
    category: "introducao",
    videos: [
      {
        title: "Aula 1: O que é a bananicultura e por que ela é um grande negócio?",
        description:
          "Introdução ao mundo da bananicultura e suas oportunidades de negócio",
        videoUrl:
          "https://drive.google.com/file/d/15wa55mq-z17xqMLYZED8qpmWjGq5KlFM/preview",
        duration: "6min e 24seg",
        order: 1,
        practicalTask: {
          title: "Pesquise o mercado local de banana",
          description: "Visite 3 mercados ou centrais de abastecimento da sua região e anote os preços da banana por kg, variedades disponíveis e origem dos produtos.",
          actionType: "immediate",
          difficulty: "easy",
          estimatedTime: "2 horas",
          materials: ["Caderno", "Caneta", "Smartphone para fotos"]
        }
      },
      {
        title: "Aula 2: Fatores essenciais para um cultivo sustentável e lucrativo",
        description:
          "Elementos fundamentais para garantir sustentabilidade e rentabilidade na bananicultura",
        videoUrl:
          "https://drive.google.com/file/d/1kTjj1cm5YEXGas2oyOYQ6W8IOJRKpSuv/preview",
        duration: "7min e 40seg",
        order: 2,
        practicalTask: {
          title: "Analise sua propriedade",
          description: "Faça um mapeamento básico da sua propriedade: tipo de solo, disponibilidade de água, declividade e acesso. Tire fotos das diferentes áreas e anote as características principais.",
          actionType: "immediate",
          difficulty: "medium",
          estimatedTime: "3 horas",
          materials: ["Trena", "Smartphone", "Caderno", "Pá pequena para análise do solo"]
        }
      },
      {
        title: "Aula 3: Planejamento inicial do bananal",
        description: "Como planejar adequadamente a implantação de um bananal",
        videoUrl:
          "https://drive.google.com/file/d/1E8KHMzoLVBGnVN_XLKxkGY1Fj1y1D_ZS/preview",
        duration: "16min e 14seg",
        order: 3,
        practicalTask: {
          title: "Crie seu plano de plantio",
          description: "Desenhe um croqui da sua área de plantio com espaçamento de 3x2 metros entre plantas. Calcule quantas mudas você precisará e liste os fornecedores locais de mudas de banana.",
          actionType: "immediate",
          difficulty: "medium",
          estimatedTime: "2 horas",
          materials: ["Papel milimetrado", "Lápis", "Calculadora", "Lista de fornecedores"]
        }
      },
    ],
  },
  {
    title: "MÓDULO 2 – Escolha da Área Ideal para Implantação",
    description:
      "Aprenda a selecionar e preparar adequadamente a área para implantação do bananal",
    imageUrl:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop",
    videoCount: 4,
    duration: "60min",
    category: "area-implantacao",
    videos: [
      {
        title: "Aula 1: Critérios para escolha da área",
        description:
          "Fatores essenciais a considerar na seleção da área para bananicultura",
        videoUrl: "https://drive.google.com/file/d/1uuFaD0T6ikyZiTpAqOODztJRN2S_im8g/preview",
        duration: "15min",
        order: 1,
      },
      {
        title: "Aula 2: Análise de solo e condições climáticas",
        description:
          "Como avaliar as condições de solo e clima para o cultivo da banana",
        videoUrl: "https://drive.google.com/file/d/1xd4OBjpcNVh8Vpudkplcea8Z_poJP1zn/preview",
        duration: "18min",
        order: 2,
      },
      {
        title: "Aula 3: Preparação e adequação da área",
        description: "Técnicas de preparação e adequação da área escolhida",
        videoUrl: "https://drive.google.com/file/d/1pubEYM5zMKH-0y16uw7w5qlM1sZ6bRbJ/preview",
        duration: "12min",
        order: 3,
      },
      {
        title: "Aula 4: Implementação prática da área",
        description: "Aplicação prática dos conceitos aprendidos na implementação da área",
        videoUrl: "https://drive.google.com/file/d/1ZE_bsL_Ml55w_kDMZwOp_UMhukyTNrh6/preview",
        duration: "15min",
        order: 4,
        practicalTask: {
          title: "Implemente o plano na sua propriedade",
          description: "Aplique os conceitos aprendidos iniciando a implementação prática na área escolhida da sua propriedade. Documente o processo com fotos e anotações.",
          actionType: "immediate",
          difficulty: "medium",
          estimatedTime: "4 horas",
          materials: ["Ferramentas de campo", "Smartphone para documentação", "Caderno", "Equipamentos de proteção"]
        }
      },
    ],
  },
  {
    title: "MÓDULO 3 – Plantio Eficiente",
    description:
      "Técnicas e estratégias para realizar um plantio eficiente e bem-sucedido da bananeira",
    imageUrl:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop",
    videoCount: 2,
    duration: "35min",
    category: "plantio-eficiente",
    videos: [
      {
        title: "Aula 1: Técnicas de plantio da bananeira",
        description: "Métodos corretos de plantio para garantir o desenvolvimento adequado",
        videoUrl: "https://drive.google.com/file/d/1a9wcnSKoe_4Lf7WeoEmliioh_cEU3BnP/preview",
        duration: "18min",
        order: 1,
      },
      {
        title: "Aula 2: Cuidados pós-plantio e manejo inicial",
        description: "Cuidados essenciais após o plantio e manejo inicial da cultura",
        videoUrl: "https://drive.google.com/file/d/1izBZ4jwS5I22RfDyS-LD64SxO11zqrqL/preview",
        duration: "17min",
        order: 2,
      },
    ],
  },
];
