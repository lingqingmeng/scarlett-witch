import bcrypt from 'bcrypt';
import env from '../config/env';
import sequelize from '../config/database';
import User, { UserRole } from '../models/User';

const parseArgs = (): Record<string, string> => {
  return process.argv.slice(2).reduce<Record<string, string>>((acc, arg) => {
    const [key, value] = arg.split('=');
    if (key.startsWith('--') && value) {
      acc[key.replace('--', '')] = value;
    }
    return acc;
  }, {});
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
