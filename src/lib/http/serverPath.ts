import path from 'path';

// Statically scoped to `public` so that the build does not trace the whole project.
const publicDirectory = path.join(process.cwd(), 'public');

const serverPath = (publicFilePath: string) => {
  const filePath = path.join(publicDirectory, publicFilePath);
  if (filePath !== publicDirectory && !filePath.startsWith(publicDirectory + path.sep)) {
    throw new Error(`"${publicFilePath}" resolves outside of the public directory`);
  }
  return filePath;
};

export default serverPath;
