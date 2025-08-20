/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import hbs from 'hbs';
import { ValidationPipe } from '@nestjs/common';
import { RedisStore } from 'connect-redis';
import session from 'express-session';
import { createClient } from 'redis';
import { UnauthorizedFilter } from './exceptions/unauthorized-exception.filter';
import { NotFoundFilter } from './exceptions/not-found.filter';
import { InternalServerErrorFilter } from './exceptions/internal-server-error.filter';
import moment from 'moment';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(
    new UnauthorizedFilter(),
    new NotFoundFilter(),
    new InternalServerErrorFilter(),
  );
  // ioredis client
  // const RedisStore = connectRedis(session);
  const redisClient = createClient({
    url: configService.get<string>('REDIS_URL') || 'redis://localhost:6379',
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis client connected');
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
  });
  await redisClient.connect();
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'auctioning:sess:',
  });

  app.use(
    session({
      store: redisStore,
      secret: configService.get<string>('SESSION_SECRET') || 'super-secret',
      resave: false,
      saveUninitialized: false,
    }),
  );

  // Static + Views
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setViewEngine('hbs');
  app.setBaseViewsDir(join(__dirname, '..', 'src', 'views'));

  hbs.registerPartials(join(__dirname, '..', 'src', 'views', 'partials'));
  hbs.registerHelper('includes', (str: string, substr: string) =>
    str.includes(substr),
  );
  // new date formatting helper
  hbs.registerHelper('formatDate', (date: Date, format: string) => {
    if (!date) return '';
    return moment(date).format(format);
  });
  // ✅ Format numbers with commas (e.g., ₦1,234,567.89)
  hbs.registerHelper('amount', function (value: number) {
    if (isNaN(value)) return value;
    return new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  });

  // ✅ Auction "Ends In" formatter
  hbs.registerHelper('bidEndIn', function (endDate: string | Date) {
    const now = moment();
    const end = moment(endDate);
    const diffDays = end.diff(now, 'days');
    const diffYears = end.diff(now, 'years');
    const diffMonths = end.diff(now, 'months');
    const diffWeeks = end.diff(now, 'weeks');
    const diffHours = end.diff(now, 'hours');

    if (diffYears > 1) return `${diffYears} years`;
    if (diffYears === 1) return `1 year`;
    if (diffMonths > 1) return `${diffMonths} months`;
    if (diffMonths === 1) return `1 month`;
    if (diffWeeks > 1) return `${diffWeeks} weeks`;
    if (diffWeeks === 1) return `1 week`;
    if (diffDays > 1) return `${diffDays} days`;
    if (diffDays === 1) return `1 day`;
    if (diffHours > 1) return `${diffHours} hours`;
    if (diffHours === 1) return `1 hour`;

    const diffMinutes = end.diff(now, 'minutes');
    if (diffMinutes > 1) return `${diffMinutes} minutes`;
    if (diffMinutes === 1) return `1 minute`;

    const diffSeconds = end.diff(now, 'seconds');
    return diffSeconds > 0 ? `${diffSeconds} seconds` : 'Expired';
  });
  // ✅ Countdown (live-updating requires client-side JS, this is server-side static)
  hbs.registerHelper('countdown', function (endDate: string | Date) {
    return moment(endDate).fromNow(); // e.g., "in 3 days" / "in 2 hours"
  });
  hbs.registerHelper('json', function (context) {
    return JSON.stringify(context);
  });
  hbs.registerHelper('default', function (value, defaultValue) {
    return value != null && value !== '' ? value : defaultValue;
  });

  app.set('view options', { layout: 'layouts/main' });

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port, () => {
    console.info(`🚀 App running on http://localhost:${port}`);
  });
}
void bootstrap();
