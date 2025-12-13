import bcrypt from 'bcrypt';
import env from '../config/env';
import sequelize from '../config/database';
import User, { UserRole } from '../models/User';

const parseArgs = (): Record<string, string> => {
  const argv = process.argv.slice(2);
  const args: Record<string, string> = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;

    const [rawKey, inlineValue] = token.split('=');
    const key = rawKey.replace(/^--/, '');

    if (inlineValue) {
      args[key] = inlineValue;
      continue;
    }

    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      i += 1; // skip consumed value
    }
  }

  return args;
};

const main = async () => {
  const args = parseArgs();
  const email = args.email ?? process.env.ADMIN_EMAIL;
  const password = args.password ?? process.env.ADMIN_PASSWORD;
  const role = (args.role as UserRole | undefined) ?? 'admin';

  if (!email || !password) {
    throw new Error('Usage: npm run create:user -- --email=user@example.com --password=Secret123 --role=admin');
  }

  await sequelize.authenticate();
  await sequelize.sync();

  const passwordHash = await bcrypt.hash(password, 12);
  const [user, created] = await User.findOrCreate({
    where: { email },
    defaults: { email, passwordHash, role },
  });

  if (!created) {
    user.passwordHash = passwordHash;
    user.role = role;
    await user.save();
  }

  // eslint-disable-next-line no-console
  console.log(`User ${email} ${created ? 'created' : 'updated'} with role ${role} in ${env.nodeEnv} environment.`);

  process.exit(0);
};

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
