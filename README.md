# TOBeauty — Premium Nail Salon Management 💅✨

Plataforma de gestão de luxo para salões de manicure, focada em elegância, analytics de alta performance e experiência do utilizador premium.

## 🚀 Funcionalidades Principais

- **Agenda Pro Max**: Calendário inteligente com linha de tempo em tempo real, destaque automático do dia atual e gestão visual de marcações.
- **Painel de Controlo (Analytics)**: Inteligência de dados com ranking de clientes V.I.P, best-sellers de inventário, distribuição de métodos de pagamento e análise de picos de faturação.
- **Gestão de Inventário**: Controlo total da loja e stock com alertas visuais.
- **Faturação & Despesas**: Fluxo completo de gestão financeira integrado.
- **Sistema de Planos**: Estrutura de tiering (Básico, Pro, Premium) com badges dinâmicos.
- **Portfolio & Equipa**: Gestão de montra visual e profissionais.

## 🛠️ Tecnologias

- **Frontend**: React.js + Vite
- **Styling**: Tailwind CSS (Luxe Noir Aesthetics)
- **Animações**: Framer Motion
- **Backend**: Supabase (Database & Auth)
- **Deployment**: Vercel

## ⚙️ Configuração Local & Deploy

1. **Instalar Dependências**:
   ```bash
   npm install
   ```

2. **Configuração Supabase**:
   - Crie um projeto no [Supabase](https://supabase.com).
   - Execute o conteúdo de `database_schema.sql` no SQL Editor do Supabase.
   - Crie um ficheiro `.env` com as suas chaves:
     ```env
     VITE_SUPABASE_URL=seu_url
     VITE_SUPABASE_ANON_KEY=sua_chave
     ```

3. **Iniciar Desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Deploy no Vercel**:
   - Ligue o seu repositório GitHub ao Vercel.
   - Adicione as variáveis de ambiente acima nas definições do projeto no Vercel.

---
*Desenvolvido com foco no detalhe e na sofisticação.*
