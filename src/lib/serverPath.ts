import path from 'path';

// Statically scoped to `public` so that the build does not trace the whole project.
const serverPath = (publicFilePath: string) => {
  return path.join(process.cwd(), 'public', publicFilePath);
};

export default serverPath;
