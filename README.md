# 1 Install
rename .env.example at package/frontend & package/backend to .env

# 2 Install
bun run install:all

# 3 Setup database
bun run db:setup

# 4 Develop
bun run dev