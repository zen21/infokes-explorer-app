# 1 Install
rename .env.example at package/frontend & package/backend to .env

# 2 Install
bun run install:all

# 3 Setup database
bun run db:setup

# 4 Develop
bun run dev

# Info
[be] 🚀 File Explorer API is running at http://localhost:3001
[be] 📚 Swagger documentation available at http://localhost:3001/swagger
[fe] http://localhost:5173