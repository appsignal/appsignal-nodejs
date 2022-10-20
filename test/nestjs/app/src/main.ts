import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"

const port = process.env.PORT

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(port as string)
}
bootstrap()
