# Como Adicionar Vídeos do Google Drive às Trilhas de Aprendizado

## Passo a Passo para Configurar os Vídeos

### 1. Preparar os Vídeos no Google Drive

1. **Upload dos vídeos**: Envie todos os seus vídeos para o Google Drive
2. **Organização**: Recomendamos organizar os vídeos em pastas por trilha (ex: "Fundamentos da Agricultura", "Controle de Pragas", etc.)

### 2. Configurar Permissões de Compartilhamento

Para cada vídeo que você deseja adicionar:

1. **Clique com o botão direito** no arquivo de vídeo
2. **Selecione "Compartilhar"**
3. **Clique em "Alterar para qualquer pessoa com o link"**
4. **Defina as permissões como "Visualizador"**
5. **Clique em "Concluído"**

### 3. Obter o ID do Vídeo

1. **Clique com o botão direito** no vídeo
2. **Selecione "Obter link"**
3. **Copie o link** - ele será algo como:
   ```
   https://drive.google.com/file/d/1ABC123DEF456GHI789/view?usp=sharing
   ```
4. **Extraia o ID** - no exemplo acima, o ID é: `1ABC123DEF456GHI789`

### 4. Atualizar o Arquivo de Configuração

Abra o arquivo `server/learning-content.ts` e substitua os placeholders `SEU_ID_AQUI` pelos IDs reais:

```typescript
// ANTES (placeholder)
videoUrl: "https://drive.google.com/file/d/SEU_ID_AQUI/preview",

// DEPOIS (com ID real)
videoUrl: "https://drive.google.com/file/d/1ABC123DEF456GHI789/preview",
```

### 5. Exemplo Completo de Configuração

```typescript
{
  title: "Introdução à Agricultura Moderna",
  description: "Visão geral dos princípios da agricultura moderna e sustentável",
  videoUrl: "https://drive.google.com/file/d/1ABC123DEF456GHI789/preview",
  duration: "35min",
  order: 1,
}
```

### 6. Personalizar Trilhas e Vídeos

Você pode também:

- **Adicionar novas trilhas**: Crie novos objetos no array `learningTracksConfig`
- **Alterar títulos e descrições**: Modifique os campos `title` e `description`
- **Ajustar durações**: Atualize o campo `duration` com a duração real do vídeo
- **Reordenar vídeos**: Modifique o campo `order`

### 7. Testar a Configuração

1. **Salve o arquivo** `learning-content.ts`
2. **Reinicie a aplicação** (ela reinicia automaticamente)
3. **Acesse a seção "Trilhas de Aprendizado"**
4. **Teste cada vídeo** clicando em "Assistir"

## Estrutura das Trilhas Atuais

### 1. Fundamentos da Agricultura (8 vídeos)
- Introdução à Agricultura Moderna
- Preparação e Análise do Solo
- Seleção de Sementes e Variedades
- Técnicas de Plantio
- Nutrição e Adubação
- Manejo de Cultura
- Colheita e Pós-Colheita
- Agricultura Sustentável

### 2. Controle de Pragas e Doenças (6 vídeos)
- Identificação de Pragas
- Identificação de Doenças
- Controle Biológico
- Controle Químico Responsável
- Manejo Integrado de Pragas
- Prevenção e Monitoramento

### 3. Manejo do Solo (5 vídeos)
- Física do Solo
- Química do Solo
- Biologia do Solo
- Conservação do Solo
- Plantio Direto

### 4. Irrigação e Fertirrigação (4 vídeos)
- Sistemas de Irrigação
- Manejo da Irrigação
- Fertirrigação
- Eficiência Hídrica

## Funcionalidades da Interface

### Para os Usuários:
- **Visualização de trilhas**: Cards com informações e progresso
- **Player de vídeo**: Interface completa com iframe do Google Drive
- **Controle de progresso**: Marcar vídeos como concluídos
- **Restrições por plano**: Acesso limitado baseado no plano (gratuito, pro, premium)

### Planos de Acesso:
- **Gratuito**: Primeira trilha apenas
- **Pro**: Primeiras 5 trilhas
- **Premium**: Acesso completo a todas as trilhas

## Formatos de Vídeo Suportados

O Google Drive suporta os seguintes formatos para reprodução em iframe:
- MP4
- WebM
- AVI
- MOV
- WMV
- FLV
- 3GPP

## Dicas Importantes

1. **Qualidade**: Recomendamos vídeos em resolução mínima de 720p para melhor experiência
2. **Duração**: Vídeos entre 15-45 minutos têm melhor engajamento
3. **Títulos**: Use títulos descritivos e objetivos
4. **Descrições**: Inclua informações úteis sobre o conteúdo do vídeo
5. **Ordem**: Organize os vídeos em sequência lógica de aprendizado

## Solução de Problemas

### Vídeo não carrega:
- Verifique se as permissões de compartilhamento estão corretas
- Confirme se o ID do vídeo está correto no arquivo de configuração
- Teste o link diretamente no navegador

### Erro de permissão:
- Certifique-se de que o vídeo está compartilhado como "Qualquer pessoa com o link"
- Verifique se não há restrições de domínio na conta do Google Drive

### Interface não atualiza:
- Reinicie a aplicação
- Limpe o cache do navegador
- Verifique se não há erros de sintaxe no arquivo de configuração