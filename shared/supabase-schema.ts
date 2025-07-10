import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  uuid,
  boolean,
  date,
  time,
  numeric,
  point
} from "drizzle-orm/pg-core";

// Schema adaptado para Supabase existente
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: varchar("nome").notNull(),
  email: varchar("email").notNull().unique(),
  cpf: varchar("cpf").notNull().unique(),
  senhaHash: varchar("senha_hash").notNull(),
  telefone: varchar("telefone"),
  plano: varchar("plano"),
  statusPagamento: boolean("status_pagamento"),
  dataVencimento: date("data_vencimento"),
  criadoEm: timestamp("criado_em").defaultNow(),
  atualizadoEm: timestamp("atualizado_em").defaultNow(),
});

export const fazendas = pgTable("fazendas", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  nome: varchar("nome").notNull(),
  localizacao: varchar("localizacao"),
  areaHectares: numeric("area_hectares"),
  tipoProducao: varchar("tipo_producao"),
  coordenadas: point("coordenadas"),
  dataCadastro: timestamp("data_cadastro").defaultNow(),
});

export const chats = pgTable("chats", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  mensagemUsuario: text("mensagem_usuario").notNull(),
  mensagemIa: text("mensagem_ia"),
  tipo: varchar("tipo"),
  anexos: jsonb("anexos"),
  dataCriacao: timestamp("data_criacao").defaultNow(),
});

export const eventosCalendario = pgTable("eventos_calendario", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  titulo: varchar("titulo").notNull(),
  tipo: varchar("tipo"),
  dataEvento: date("data_evento").notNull(),
  horaEvento: time("hora_evento"),
  observacoes: text("observacoes"),
  realizado: boolean("realizado").default(false),
  lembretes: jsonb("lembretes"),
  criadoEm: timestamp("criado_em").defaultNow(),
});

export const alertasClimaticos = pgTable("alertas_climaticos", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  tipo: varchar("tipo").notNull(),
  severidade: varchar("severidade"),
  titulo: varchar("titulo").notNull(),
  mensagem: text("mensagem").notNull(),
  cidade: varchar("cidade"),
  ativo: boolean("ativo").default(true),
  criadoEm: timestamp("criado_em").defaultNow(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Fazenda = typeof fazendas.$inferSelect;
export type InsertFazenda = typeof fazendas.$inferInsert;
export type Chat = typeof chats.$inferSelect;
export type InsertChat = typeof chats.$inferInsert;
export type EventoCalendario = typeof eventosCalendario.$inferSelect;
export type InsertEventoCalendario = typeof eventosCalendario.$inferInsert;
export type AlertaClimatico = typeof alertasClimaticos.$inferSelect;