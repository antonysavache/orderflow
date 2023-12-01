import { NestFactory } from '@nestjs/core'
import { BybitModule } from './bybit.module'

async function bootstrap() {
  const app = await NestFactory.create(BybitModule)

  setupExceptionCatchers()
  await app.listen(3000)
}

function setupExceptionCatchers() {
  process.on('uncaughtException', (e) => {
    console.error(new Date(), 'unhandled exception: ', e?.stack, e)
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  process.on('unhandledRejection', (e: any, p) => {
    console.error(new Date(), 'unhandled rejection: ', e?.stack, e, p)
  })
}

bootstrap()
