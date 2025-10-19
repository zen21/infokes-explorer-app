import { createApp } from './api/app';

const app = createApp();
const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`🚀 File Explorer API is running at http://localhost:${port}`);
  console.log(`📚 Swagger documentation available at http://localhost:${port}/swagger`);
});